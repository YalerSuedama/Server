import { injectable } from "inversify";
import * as _ from "lodash";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { RequestLimit } from "src/app/models";
import { RequestLimitService } from "../../app";
import { ConfigAmadeus } from "../util/configAmadeus";

interface RequestCache {
    numberOfCalls: number;
    expirationTime: moment.Moment;
}

@injectable()
export class CachedRequestLimitService implements RequestLimitService {

    protected maximumAllowedCalls = new ConfigAmadeus().maximumAllowedCalls;
    protected expirationTimeWindow = new ConfigAmadeus().expirationTimeWindow;

    private requestCache = new ExpirationStrategy(new MemoryStorage());

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
