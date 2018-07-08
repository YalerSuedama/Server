import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { FieldErrors, ValidateError } from "tsoa";
import { AmadeusService, FeeService, LiquidityService, TickerService, TokenPairsService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token, TokenPairTradeInfo } from "../../../app/models";
import * as Utils from "../../util";

@injectable()
export abstract class BaseFeeService {
    constructor(
        @inject(TYPES.AmadeusService)
        protected amadeusService: AmadeusService,

        @inject(TYPES.TickerService) @named("Repository")
        protected tickerService: TickerService,

        @inject(TYPES.TokenService)
        protected tokenService: TokenService,

        @inject(TYPES.TokenPairsService)
        protected tokenPairsService: TokenPairsService,

        @inject(TYPES.LiquidityService)
        protected liquidityService: LiquidityService,

        protected readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    protected async getFee(feeValue: any, token?: Token, amount?: BigNumber): Promise<BigNumber> {
        if (token.symbol === "ZRX") {
            return amount.mul(feeValue);
        }

        const zeroExToken = await this.tokenService.getToken("ZRX");

        const ticker: Ticker = await this.tickerService.getTicker(token, zeroExToken);
        if (!ticker) {
            return Utils.toBaseUnit(0, zeroExToken.decimals);
        }
        const zrxAmount = this.liquidityService.getConvertedAmount(amount, ticker.price, token, zeroExToken);

        return zrxAmount.mul(feeValue).truncated();
    }
}
