import * as chai from "chai";
import * as moment from "moment";
import "reflect-metadata";

describe("FromCacheTickerService", () => {
    context("When ticker is not on cache", () => {
        it("Should return null when getting the ticker.");
        it("Should return the ticker after adding it to the cache");
    });
    context("When ticker is in the cache", () => {
        it("Should return the ticker when getting the ticker.");
        it("Should return the replaced ticker after adding a new one to the cache.");
        it("Should return null after ticker is expired.");
    });
});
