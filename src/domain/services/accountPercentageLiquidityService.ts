import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import { AmadeusService, ExchangeService, LiquidityService, TYPES } from "../../app";
import { Token, TokenPool } from "../../app/models";

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
        const availableAmount = totalAmount.times(this.getAvailablePercentage()).dividedToIntegerBy(1);
        return {
            token,
            maximumAmount: this.getRoundAmount(availableAmount),
            minimumAmount: new BigNumber(0),
            precision: 6,
        };
    }

    private getRoundAmount(amount: BigNumber): BigNumber {
        if (amount.lessThanOrEqualTo(10)) {
            return amount;
        }
        const base = new BigNumber(10).pow(amount.e);
        return amount.dividedToIntegerBy(base).mul(base);
    }

    private getAvailablePercentage(): BigNumber {
        if (config.has(AccountPercentageLiquidityService.LIQUIDITY_KEY)) {
            return new BigNumber(config.get<number>(AccountPercentageLiquidityService.LIQUIDITY_KEY));
        }

        return AccountPercentageLiquidityService.DEFAULT_PERCENTAGE;
    }
}
