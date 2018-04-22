import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { AmadeusService, FeeService, TickerService, TokenService, TYPES } from "../../app";
import { Ticker, Token } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ConstantFeeService implements FeeService {
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService, @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService, @inject(TYPES.TokenService) private tokenService: TokenService, private readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    public async getMakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(this.constantFee.maker);
    }

    public async getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        if (token.symbol === "ZRX") {
            return amount.mul(this.constantFee.taker);
        }

        const zeroExToken = await this.tokenService.getToken("ZRX");

        const ticker: Ticker = await this.tickerService.getTicker(token, zeroExToken);
        if (!ticker) {
            return Utils.toBaseUnit(0);
        }

        return ticker.price.mul(amount).mul(this.constantFee.taker).truncated();
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }
}
