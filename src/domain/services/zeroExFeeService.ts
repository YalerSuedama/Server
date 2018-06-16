import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { FeeService, TYPES } from "../../app";
import { Fee, Token } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ZeroExFeeService implements FeeService {
    constructor( @inject(TYPES.FeeService) @named("ConstantReserveManager") private constantFeeService: FeeService) {
    }

    public async getMakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(0, token.decimals);
    }

    public async getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return Utils.toBaseUnit(0, token.decimals);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.constantFeeService.getFeeRecipient(token);
    }

    public async calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee> {
        return null;
    }
}
