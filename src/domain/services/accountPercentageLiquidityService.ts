import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import { AmadeusService, ExchangeService, LiquidityService, TYPES } from "../../app";
import { Token, TokenPool } from "../../app/models";

@injectable()
export class AccountPercentageLiquidityService implements LiquidityService {
    private static readonly LIQUIDITY_KEY = "amadeus.liquidityPercentage";
    private static readonly DEFAULT_PERCENTAGE = new BigNumber("0.1");

    constructor(
        @inject(TYPES.ExchangeService) private exchangeService: ExchangeService,
        @inject(TYPES.AmadeusService) private amadeusService: AmadeusService,
    ) { }

    public async getAvailableAmount(token: Token): Promise<TokenPool> {
        if (!token) {
            throw new Error("Token must be defined");
        }

        const totalAmount = await this.exchangeService.getBalance(this.amadeusService.getMainAddress(), token);
        const percentage = this.getAvailablePercentage();
        return {
            token,
            availableAmount: totalAmount.times(percentage),
        };
    }

    private getAvailablePercentage(): BigNumber {
        if (config.has(AccountPercentageLiquidityService.LIQUIDITY_KEY)) {
            return new BigNumber(config.get(AccountPercentageLiquidityService.LIQUIDITY_KEY) + "");
        }

        return AccountPercentageLiquidityService.DEFAULT_PERCENTAGE;
    }
}
