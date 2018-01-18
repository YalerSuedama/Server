import { BigNumber } from "bignumber.js";
import { injectable } from "inversify";
import * as moment from "moment";
import { TimeService, TYPES } from "../../app";

@injectable()
export class TimeServiceImpl implements TimeService {
    private readonly expirationMilliseconds = 300000;

    public getExpirationTimestamp(): string {
        return new BigNumber(moment().add(this.expirationMilliseconds, "ms").unix()).toString();
    }
}
