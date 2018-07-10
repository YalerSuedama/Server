import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { PriceService, TYPES } from "../../../src/app";
import { FromTickerPriceService } from "../../../src/domain/index";
import { amadeusServiceStubFactory, liquidityServiceStubFactory, tickerServiceStubFactory, tokenServiceStubFactory } from "../../stubs";
import { createContainer, createToken, DEFAULT_ADDRESS, TOKENS } from "../../stubs/util";

const chaiSubsetLoader = () => require("chai-subset");
const chaiThingsLoader = () => require("chai-things");
chai.use(chaiSubsetLoader());
chai.use(chaiThingsLoader());
const should = chai.should();
const expect = chai.expect;

describe("FromTickerPriceService", () => {
    const iocContainer = createContainer(true, amadeusServiceStubFactory, liquidityServiceStubFactory, tickerServiceStubFactory, tokenServiceStubFactory, (c: Container) => {
        c.bind<PriceService>(TYPES.PriceService).to(FromTickerPriceService);
    });

    context("when correct parameters are informed", () => {
        it("should return the price info", async () => {
            const makerTokenSymbol = TOKENS[1];
            const makerTokenAddress = DEFAULT_ADDRESS + makerTokenSymbol;
            const takerTokenSymbol = TOKENS[2];
            const takerTokenAddress = DEFAULT_ADDRESS + takerTokenSymbol;
            const returned = await iocContainer.get<PriceService>(TYPES.PriceService).calculatePrice(makerTokenAddress, takerTokenAddress, null);
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.exist;
            // tslint:disable-next-line:no-unused-expression
            expect(returned.tokenFrom === makerTokenAddress).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(returned.tokenTo === takerTokenAddress).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.price).toString()).to.be.eq(new BigNumber(2).toString());
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.maxAmountFrom).greaterThan(0)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.minAmountFrom).greaterThan(0)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.maxAmountTo).greaterThan(0)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.minAmountTo).greaterThan(0)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.maxAmountFrom).greaterThan(returned.minAmountFrom)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(new BigNumber(returned.maxAmountTo).greaterThan(returned.minAmountTo)).to.be.ok;
        });
    });
});
