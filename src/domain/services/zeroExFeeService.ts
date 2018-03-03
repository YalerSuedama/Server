import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { FeeService, TYPES } from "../../app";
import { Token } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ZeroExFeeService implements FeeService {
    constructor( @inject(TYPES.FeeService) @named("Constant") private constantFeeService: FeeService) {
    }

    public async getMakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(0);
    }

    public async getTakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(0);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.constantFeeService.getFeeRecipient(token);
    }
}
