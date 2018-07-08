import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import * as config from "config";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { AmadeusService, ExchangeService, LiquidityService, TYPES } from "../../src/app";
import { SignedOrder, Token } from "../../src/app/models";
import { AccountPercentageLiquidityService } from "../../src/domain/services/accountPercentageLiquidityService";
import { amadeusServiceStub, exchangeServiceStub } from "../stubs";
import { createContainer, createToken, DEFAULT_ADDRESS } from "../stubs/util";
import { expect, should } from "../util";

const totalAmount = new BigNumber(10).pow(15);

describe("AccountPercentageLiquidityService", () => {
    let liquidityService: LiquidityService;
    const percentage = new BigNumber(config.get<number>("amadeus.liquidityPercentage"));
    const availableAmount = totalAmount.times(percentage);

    beforeEach((done) => {
        liquidityService = new AccountPercentageLiquidityService(exchangeServiceStub, amadeusServiceStub);
        done();
    });

    it("Throws when token not informed.", async () => {
        try {
            const returned = await liquidityService.getAvailableAmount(null);
            chai.assert.fail(returned, null, "Expected to have thrown error, but returned.");
        } catch (error) {
            expect(error).to.be.instanceOf(Error).and.that.has.property("message", "Token must be defined");
        }
    });
    context("When the available amount is greater than the minimum amount permitted.", async () => {
        it("Returns the maximum amount of the pool as the available percentage of the token.", async () => {
            const returned = await liquidityService.getAvailableAmount(createToken("TST"));
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.be.ok;
            expect(returned.maximumAmount.toString()).to.be.eq(availableAmount.toString());
        });
        it("Returns the minimum amount of the pool as the minimum amount permitted.", async () => {
            const returned = await liquidityService.getAvailableAmount(createToken("TST"));
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.be.ok;
            expect(returned.minimumAmount.toString()).to.be.eq(amadeusServiceStub.getMinimumAmount().toString());
        });
    });
    context("When the available amount is lesser than the minimum amount permitted.", () => {
        beforeEach((done) => {
            exchangeServiceStub.getBalance = (address, token?) => Promise.resolve(amadeusServiceStub.getMinimumAmount());
            done();
        });
        it("Returns the maximum amount as zero when the available amount is lesser than the minimum amount permitted.", async () => {
            const returned = await liquidityService.getAvailableAmount(createToken("TST"));
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.be.ok;
            expect(returned.maximumAmount.toString()).to.be.eq(new BigNumber(0).toString());
        });
        it("Returns the minimum amount as zero when the available amount is lesser than the minimum amount permitted.", async () => {
            const returned = await liquidityService.getAvailableAmount(createToken("TST"));
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.be.ok;
            expect(returned.maximumAmount.toString()).to.be.eq(new BigNumber(0).toString());
        });
    });
});
