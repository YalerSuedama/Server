import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import { AmadeusService, ExchangeService, LiquidityService, TYPES } from "../../app";
import { Token, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class AccountPercentageLiquidityService implements LiquidityService {
    private static readonly LIQUIDITY_KEY = "amadeus.liquidityPercentage";
    private static readonly DEFAULT_PERCENTAGE = new BigNumber("0.02");

    constructor(
        @inject(TYPES.ExchangeService) private exchangeService: ExchangeService,
        @inject(TYPES.AmadeusService) private amadeusService: AmadeusService,
    ) { }

    public async getAvailableAmount(token: Token): Promise<TokenPool> {
        if (!token) {
            throw new Error("Token must be defined");
        }

        const totalAmount = await this.exchangeService.getBalance(this.amadeusService.getMainAddress(), token);
        const minimun = this.amadeusService.getMinimumAmount();
        const availablePercentage = this.getAvailablePercentage();
        let availableAmount = totalAmount.times(availablePercentage).dividedToIntegerBy(1);
        availableAmount = Utils.getRoundAmount(availableAmount, token.decimals);
        return {
            maximumAmount: availableAmount.greaterThan(minimun) ? availableAmount : new BigNumber(0),
            minimumAmount: availableAmount.greaterThan(minimun) ? minimun : new BigNumber(0),
            precision: this.amadeusService.getPrecision(),
            token,
        };
    }

    public getConvertedAmount(tokenFromAmount: BigNumber, price: BigNumber, tokenFrom: Token, tokenTo: Token): BigNumber {
        const realTokenFromAmount = tokenFromAmount.dividedBy(new BigNumber(Math.pow(10, tokenFrom.decimals)));
        const realTokenToAmount = realTokenFromAmount.mul(price);
        const tokenToAmountToBaseUnit = Utils.toBaseUnit(realTokenToAmount, tokenTo.decimals);

        return tokenToAmountToBaseUnit.dividedToIntegerBy(1);
    }

    public getConvertedPrice(tokenFromAmount: BigNumber, tokenToAmount: BigNumber, tokenFrom: Token, tokenTo: Token): BigNumber {
        const realTokenFromAmount = tokenFromAmount.dividedBy(tokenFrom.decimals);
        const realTokenToAmount = tokenToAmount.dividedBy(tokenTo.decimals);

        return realTokenFromAmount.dividedBy(realTokenToAmount);
    }

    private getAvailablePercentage(): BigNumber {
        if (config.has(AccountPercentageLiquidityService.LIQUIDITY_KEY)) {
            return new BigNumber(config.get<number>(AccountPercentageLiquidityService.LIQUIDITY_KEY));
        }

        return AccountPercentageLiquidityService.DEFAULT_PERCENTAGE;
    }
}
