import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import { AmadeusService, FeeService, TYPES } from "../../app";
import { Token } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ConstantFeeService implements FeeService {
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService, private readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    public async getMakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(this.constantFee.maker);
    }

    public async getTakerFee(token?: Token): Promise<BigNumber> {
        return Utils.toBaseUnit(this.constantFee.taker);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }
}
