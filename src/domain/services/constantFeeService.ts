import * as BigNumber from "bignumber.js";
import { inject, injectable } from "inversify";
import { AmadeusService, FeeService, TYPES } from "../../app";
import * as Utils from "../util";

@injectable()
export class ConstantFeeService implements FeeService {
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService, private readonly constantFee = Utils.toBaseUnit(0)) {
    }

    public async getMakerFee(token?: string): Promise<BigNumber.BigNumber> {
        return this.constantFee;
    }

    public async getTakerFee(token?: string): Promise<BigNumber.BigNumber> {
        return this.constantFee;
    }

    public async getFeeRecipient(token?: string): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }
}
