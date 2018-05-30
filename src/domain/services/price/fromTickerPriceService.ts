import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { FieldErrors, ValidateError } from "tsoa";
import { AmadeusService, LoggerService, PriceService, TickerService, TokenService, TYPES, LiquidityService } from "../../../app";
import { Price, Ticker, Token, TokenPool } from "../../../app/models";
import * as Utils from "../../util";

@injectable()
export class FromTickerPriceService implements PriceService {
    constructor(
        @inject(TYPES.AmadeusService)
        private amadeusService: AmadeusService,

        @inject(TYPES.TickerService) @named("Repository")
        protected tickerService: TickerService,

        @inject(TYPES.TokenService)
        protected tokenService: TokenService,

        @inject(TYPES.LiquidityService)
        protected liquidityService: LiquidityService,

        @inject(TYPES.LoggerService)
        private logger: LoggerService,
    ) {
        this.logger.setNamespace("priceservice");
    }

    public async calculatePrice(tokenFromAddress: string, tokenToAddress: string, trader: string): Promise<Price> {
        const tokenFrom: Token = await this.tokenService.getTokenByAddress(tokenFromAddress);
        const tokenTo: Token = await this.tokenService.getTokenByAddress(tokenToAddress);

        const ticker: Ticker = await this.tickerService.getTicker(tokenFrom, tokenTo);
        let price: string;
        if (!ticker) {
            price = Utils.toBaseUnit(0).toString();
        } else {
            price = ticker.price.toFormat();
        }

        var tokenPool = await this.liquidityService.getAvailableAmount(tokenFrom);
        return {
            tokenFrom: tokenFromAddress,
            tokenTo: tokenToAddress,
            price: price,
            maxAmountFrom: tokenPool.maximumAmount.toFormat(),
            maxAmountTo: tokenPool.maximumAmount.mul(ticker.price).toFormat(),
            minAmountFrom: tokenPool.minimumAmount.toFormat(),
            minAmountTo: tokenPool.minimumAmount.mul(ticker.price).toFormat(),
        };
    }
}
