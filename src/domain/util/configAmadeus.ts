import * as config from "config";
import * as moment from "moment";

export class ConfigAmadeus {
    private static DEFAULT_EXPIRATION_TIME = moment.duration(1, "h");
    private static DEFAULT_MAXIMUM_ALLOWED_CALLS = 720;

    public maximumAllowedCalls: number = config.has("server.requestLimit.maximumAllowedCallsPerWindow") ? config.get("server.requestLimit.maximumAllowedCallsPerWindow") : ConfigAmadeus.DEFAULT_MAXIMUM_ALLOWED_CALLS;
    public expirationTimeWindow = config.has("server.requestLimit.timeWindow.amount") && config.has("server.requestLimit.timeWindow.unit") ? moment.duration(config.get<number>("server.requestLimit.timeWindow.amount"), config.get<moment.unitOfTime.DurationConstructor>("server.requestLimit.timeWindow.unit")) : ConfigAmadeus.DEFAULT_EXPIRATION_TIME;

}
