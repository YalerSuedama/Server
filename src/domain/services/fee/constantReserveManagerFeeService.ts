import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { AmadeusService, FeeService, TickerService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token } from "../../../app/models";
import * as Utils from "../../util";

@injectable()
export class ConstantReserveManagerFeeService implements FeeService {
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService, @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService, @inject(TYPES.TokenService) private tokenService: TokenService, private readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    public async getMakerFee(token?: Token): Promise<BigNumber> {
        return new BigNumber(0);
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

    public async calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee> {
        return null;
    }
}
