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
        const minimun = new BigNumber(config.get("amadeus.minimun") || "10000000000000");
        const availableAmount = Utils.getRoundAmount(totalAmount.times(this.getAvailablePercentage()).dividedToIntegerBy(1));
        return {
            maximumAmount: availableAmount.greaterThan(minimun) ? availableAmount : new BigNumber(0),
            minimumAmount: availableAmount.greaterThan(minimun) ? minimun : new BigNumber(0),
            precision: config.get("amadeus.decimalPlaces") || 6,
            token,
        };
    }

    private getAvailablePercentage(): BigNumber {
        if (config.has(AccountPercentageLiquidityService.LIQUIDITY_KEY)) {
            return new BigNumber(config.get<number>(AccountPercentageLiquidityService.LIQUIDITY_KEY));
        }

        return AccountPercentageLiquidityService.DEFAULT_PERCENTAGE;
    }
}
