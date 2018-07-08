import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import * as moment from "moment";
import { TimeService, TYPES } from "../../app";

@injectable()
export class TimeServiceImpl implements TimeService {
    private readonly expirationMilliseconds = config.get<number>("amadeus.defaultExpirationTime");

    public getExpirationTimestamp(): string {
        return new BigNumber(moment().utc().add(this.expirationMilliseconds, "s").unix()).toString();
    }
}
