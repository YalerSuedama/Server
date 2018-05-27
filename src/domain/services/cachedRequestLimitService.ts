import * as config from "config";
import { injectable } from "inversify";
import * as _ from "lodash";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { RequestLimit } from "src/app/models";
import { RequestLimitService } from "../../app";

interface RequestCache {
    numberOfCalls: number;
    expirationTime: moment.Moment;
}

@injectable()
export class CachedRequestLimitService implements RequestLimitService {
    private static DEFAULT_MAXIMUM_ALLOWED_CALLS = 720;
    private static DEFAULT_EXPIRATION_TIME = moment.duration(1, "h");

    protected maximumAllowedCalls = CachedRequestLimitService.DEFAULT_MAXIMUM_ALLOWED_CALLS;
    protected expirationTimeWindow = CachedRequestLimitService.DEFAULT_EXPIRATION_TIME;

    private requestCache = new ExpirationStrategy(new MemoryStorage());

    constructor() {
        if (config.has("server.requestLimit.maximumAllowedCallsPerWindow")) {
            this.maximumAllowedCalls = config.get("server.requestLimit.maximumAllowedCallsPerWindow");
        } else {
            this.maximumAllowedCalls = CachedRequestLimitService.DEFAULT_MAXIMUM_ALLOWED_CALLS;
        }

        if (config.has("server.requestLimit.timeWindow.amount") && config.has("server.requestLimit.timeWindow.unit")) {
            this.expirationTimeWindow = moment.duration(config.get<number>("server.requestLimit.timeWindow.amount"), config.get<moment.unitOfTime.DurationConstructor>("server.requestLimit.timeWindow.unit"));
        } else {
            this.expirationTimeWindow = CachedRequestLimitService.DEFAULT_EXPIRATION_TIME;
        }
    }

    public async getLimit(ip: string): Promise<RequestLimit> {
        let request = await this.requestCache.getItem<RequestCache>(ip);
        if (typeof (request) === "undefined") {
            request = this.createRequest(ip);
        } else {
            request.numberOfCalls++;
            if (moment().utc().isAfter(request.expirationTime)) {
                request = this.createRequest(ip);
            } else if (request.numberOfCalls > this.maximumAllowedCalls) {
                return Promise.resolve({
                    isLimitReached: true,
                });
            }
        }

        return Promise.resolve({
            currentLimitExpiration: request.expirationTime.unix(),
            isLimitReached: false,
            limitPerHour: this.maximumAllowedCalls,
            remainingLimit: this.maximumAllowedCalls - request.numberOfCalls,
        });
    }

    private createRequest(ip: string): RequestCache {
        const request = {
            expirationTime: moment().utc().add(this.expirationTimeWindow),
            numberOfCalls: 1,
        };
        const duration = moment.duration(request.expirationTime.diff(moment().utc()));
        this.requestCache.setItem(ip, request, { ttl: duration.asSeconds() });

        return request;
    }
}
