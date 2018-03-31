import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { FieldErrors, ValidateError } from "tsoa";
import { AmadeusService, ExchangeService, FeeService, LoggerService, TickerService, TokenPairsService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token, TokenPairTradeInfo } from "../../../app/models";
import * as Utils from "../../util";

@injectable()
export class ConstantFeeService {
    constructor( @inject(TYPES.AmadeusService) protected amadeusService: AmadeusService, @inject(TYPES.TickerService) @named("Repository") protected tickerService: TickerService, @inject(TYPES.TokenService) protected tokenService: TokenService, @inject(TYPES.TokenPairsService) protected tokenPairsService: TokenPairsService, @inject(TYPES.ExchangeService) protected exchangeService: ExchangeService, @inject(TYPES.LoggerService) protected logger: LoggerService, protected readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    public async getFee(constantFee: any, token?: Token, amount?: BigNumber): Promise<BigNumber> {
        if (token.symbol === "ZRX") {
            return amount.mul(constantFee);
        }

        const zeroExToken = await this.tokenService.getToken("ZRX");

        const ticker: Ticker = await this.tickerService.getTicker(token, zeroExToken);
        if (!ticker) {
            return Utils.toBaseUnit(0);
        }

        return ticker.price.mul(amount).mul(constantFee).truncated();
    }
}
