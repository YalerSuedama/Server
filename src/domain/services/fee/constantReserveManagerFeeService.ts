import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { AmadeusService, FeeService, TickerService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token } from "../../../app/models";
import * as Utils from "../../util";
import { BaseFeeService } from "./baseFeeService";

@injectable()
export class ConstantReserveManagerFeeService extends BaseFeeService implements FeeService {

    public async getMakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return new BigNumber(0);
    }

    public async getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return this.getFee(this.constantFee.taker, token, amount);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }

    public async calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee> {
        return null;
    }
}
