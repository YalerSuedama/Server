import * as chai from "chai";
import * as config from "config";
import * as moment from "moment";
import "reflect-metadata";
import { RequestLimitService } from "../../src/app";
import { CachedRequestLimitService } from "../../src/domain";

const should = chai.should();
const expect = chai.expect;

async function delay(milliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

class WithConstructorParamsCachedRequestLimitService extends CachedRequestLimitService {
    constructor(maximumLimitForTest: number, expirationTimeWindowForTest: moment.Duration) {
        super();
        this.maximumAllowedCalls = maximumLimitForTest;
        this.expirationTimeWindow = expirationTimeWindowForTest;
    }
}

describe("CachedRequestLimitService", () => {
    const ip = "ip";
    const maximumLimit = 3;
    const testDuration = moment.duration(1, "s");
    let requestLimitService: RequestLimitService;
    beforeEach((done) => {
        requestLimitService = new WithConstructorParamsCachedRequestLimitService(maximumLimit, testDuration);
        done();
    });
    context("When no requests have been made", () => {
        it("should return an allowed request limit", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("isLimitReached", false);
        });
        it("should return a request limit with a maximum allowed equals to the config", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("limitPerHour", maximumLimit);
        });
        it("should return a request limit with a value of maximumLimit - 1", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("remainingLimit", maximumLimit - 1);
        });
        it("should return a request limit with a correct expiration window", async () => {
            const expirationWindow = moment().utc().add(testDuration).unix();
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("currentLimitExpiration", expirationWindow);
        });
    });
    context("When a request has already been made", () => {
        it("should return a request limit with a value of maximumLimit - 2", async () => {
            await requestLimitService.getLimit(ip);
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("remainingLimit", maximumLimit - 2);
        });
    });
    context("When the maximum number of calls have been reached", () => {
        it("should return a disallowed request limit", async () => {
            await requestLimitService.getLimit(ip);
            await requestLimitService.getLimit(ip);
            await requestLimitService.getLimit(ip);
            await requestLimitService.getLimit(ip);
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("isLimitReached", true);
        });
    });
    context("When a request is made after the expiration is reached", () => {
        beforeEach(async () => {
            await requestLimitService.getLimit(ip);
            await delay(testDuration.asMilliseconds());
        });
        it("should return an allowed request limit", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("isLimitReached", false);
        });
        it("should return a request limit with a maximum allowed equals to the config", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("limitPerHour", maximumLimit);
        });
        it("should return a request limit with a value of maximumLimit - 1", async () => {
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("remainingLimit", maximumLimit - 1);
        });
        it("should return a request limit with an expiration in one hour", async () => {
            const expirationWindow = moment().utc().add(testDuration).unix();
            const limit = await requestLimitService.getLimit(ip);
            expect(limit).to.be.an("object").and.that.has.property("currentLimitExpiration", expirationWindow);
        });
    });
});
