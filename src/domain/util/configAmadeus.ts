import { BigNumber } from "bignumber.js";
import * as config from "config";
import * as moment from "moment";

export class ConfigAmadeus {
    private static DEFAULT_EXPIRATION_TIME = moment.duration(1, "h");
    private static DEFAULT_MAXIMUM_ALLOWED_CALLS = 720;
    private static readonly LIQUIDITY_KEY = "amadeus.liquidityPercentage";
    private static readonly DEFAULT_PERCENTAGE = new BigNumber("0.02");
    private static DEFAULT_TTL = moment.duration(5, "minutes");

    public maximumAllowedCalls = this.getmaximumAllowedCalls();
    public expirationTimeWindow = this.getExpirationTimeWindow();
    public availablePercentage = this.getAvailablePercentage();
    public cacheItemTTL = this.getCacheItemTTL();

    private getCacheItemTTL() {
        if (config.has("amadeus.ticker.cache.ttl")) {
            const ttlConfig: any = config.get("amadeus.ticker.cache.ttl");
            return moment.duration(ttlConfig.value, ttlConfig.unit);
        }
        return ConfigAmadeus.DEFAULT_TTL;
    }

    private getmaximumAllowedCalls(): number {
        if (config.has("server.requestLimit.maximumAllowedCallsPerWindow")) {
            config.get("server.requestLimit.maximumAllowedCallsPerWindow");
        }
        return ConfigAmadeus.DEFAULT_MAXIMUM_ALLOWED_CALLS;
    }

    private getExpirationTimeWindow(): any {
        if (config.has("server.requestLimit.timeWindow.amount") && config.has("server.requestLimit.timeWindow.unit")) {
            return moment.duration(config.get<number>("server.requestLimit.timeWindow.amount"), config.get<moment.unitOfTime.DurationConstructor>("server.requestLimit.timeWindow.unit"));
        }
        return ConfigAmadeus.DEFAULT_EXPIRATION_TIME;
    }

    private getAvailablePercentage(): BigNumber {
        if (config.has(ConfigAmadeus.LIQUIDITY_KEY)) {
            return new BigNumber(config.get<number>(ConfigAmadeus.LIQUIDITY_KEY));
        }

        return ConfigAmadeus.DEFAULT_PERCENTAGE;
    }
}
