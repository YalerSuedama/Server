import * as chai from "chai";
import { ReserveManagerOrderService } from "./reserveManagerOrderService";

const expect = chai.expect;

describe("ReserveManagerOrderService", () => {
    context("when tokenA informed", () => {
        it.skip("should return orders where makerTokenAddress or takerTokenAddress is tokenA");
    });
    context("when tokenB informed", () => {
        it.skip("should return orders where makerTokenAddress or takerTokenAddress is tokenB");
    });
    context("when tokenA and tokenB informed", () => {
        it.skip("should return an order with tokenA and tokenB as makerTokenAddress and takerTokenAddress (in that order).");
        it.skip("should return an order with tokenA and tokenB as takerTokenAddress and makerTokenAddress (in that order).");
        it.skip("should not return an order where tokenC is either makerTokenAddress or takerTokenAddress.");
    });
    context("when makerTokenAddress informed", () => {
        it.skip("should return an order where makerTokenAddress is this makerTokenAddress.");
        it.skip("should not return an order where makerTokenAddress is different than this makerTokenAddress.");
    });
    context("when takerTokenAddress informed", () => {
        it.skip("should return an order where tsakerTokenAddress is this takerTokenAddress.");
        it.skip("should not return an order where maskerTokenAddress is different than this makerTokenAddress.");
    });
});
