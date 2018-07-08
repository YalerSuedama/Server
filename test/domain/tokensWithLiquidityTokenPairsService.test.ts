import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { LoggerService, TokenPairsService, TYPES } from "../../src/app";
import { TokensWithLiquidityTokenPairsService } from "../../src/domain/services/tokensWithLiquidityTokenPairsService";
import { liquidityServiceStubFactory, tickerServiceStubFactory, tokenServiceStubFactory } from "../stubs";
import { createContainer, createToken, DEFAULT_ADDRESS, TOKENS } from "../stubs/util";

const chaiSubsetLoader = () => require("chai-subset");
const chaiThingsLoader = () => require("chai-things");
chai.use(chaiSubsetLoader());
chai.use(chaiThingsLoader());
const should = chai.should();
const expect = chai.expect;

describe("TokensWithLiquidityTokenPairsService", () => {
    const iocContainer = createContainer(true, liquidityServiceStubFactory, tickerServiceStubFactory, tokenServiceStubFactory, (c: Container) => {
        c.bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    });

    describe("getPair", () => {
        context("When informs valid token addresses", () => {
            it("returns token pair", async () => {
                const symbolBought = TOKENS[0];
                const addressBought = DEFAULT_ADDRESS + symbolBought;
                const symbolSold = TOKENS[1];
                const addressSold = DEFAULT_ADDRESS + symbolSold;
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).getPair(addressBought, addressSold);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.tokenA.address === addressBought).to.be.ok;
                // tslint:disable-next-line:no-unused-expression
                expect(returned.tokenB.address === addressSold).to.be.ok;
            });
        });
        context("When informs invalid token addresses", () => {
            it("returns null", async () => {
                const symbolBought = TOKENS[0];
                const addressBought = DEFAULT_ADDRESS + symbolBought;
                const symbolSold = TOKENS[1];
                const addressSold = DEFAULT_ADDRESS + symbolSold;
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).getPair(addressBought + "A", addressSold);
                // tslint:disable-next-line:no-unused-expression
                expect(returned).to.not.exist;
            });
        });
    });

    describe("listPairs", () => {
        it("should not return the same token as tokenA and tokenB", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs();
            const sameAddress = returned.find((pair) => pair.tokenA.address === pair.tokenB.address);
            // tslint:disable-next-line:no-unused-expression
            expect(sameAddress).to.not.exist;
        });
        context("When tokenA is informed", () => {
            it("returns pairs with tokenA as left-hand side or right-hand side of pair", async () => {
                const symbol = TOKENS[1];
                const address = DEFAULT_ADDRESS + symbol;
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(address);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenA.address === address)).to.be.ok;
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenB.address === address)).to.be.ok;
            });
        });
        context("When tokenB is informed", () => {
            it("returns pairs with tokenB as left-hand side or right-hand side of pair.", async () => {
                const symbol = TOKENS[1];
                const address = DEFAULT_ADDRESS + symbol;
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(null, address);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenA.address === address)).to.be.ok;
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenB.address === address)).to.be.ok;
            });
        });
        context("When tokenA and tokenB are informed", () => {
            it("returns pairs with at least one of the tokens and the other token of the pair is tokenC.", async () => {
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(DEFAULT_ADDRESS + TOKENS[0], DEFAULT_ADDRESS + TOKENS[1]);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[2])).to.be.ok;
            });
            it("returns pairs with tokenA and tokenB as one of the pairs (in that order).", async () => {
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(DEFAULT_ADDRESS + TOKENS[0], DEFAULT_ADDRESS + TOKENS[1]);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenA.address === DEFAULT_ADDRESS + TOKENS[0] && pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[1])).to.be.ok;
            });
            it("returns pairs with tokenA and tokenB as one of the pairs (in reversed order).", async () => {
                const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(DEFAULT_ADDRESS + TOKENS[1], DEFAULT_ADDRESS + TOKENS[0]);
                // tslint:disable-next-line:no-unused-expression
                expect(returned.find((pair) => pair.tokenA.address === DEFAULT_ADDRESS + TOKENS[0] && pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[1])).to.be.ok;
            });
        });
        context("When page is informed", () => {
            context("as a number smaller than 1", () => {
                it("should return error", async () => {
                    let returned;
                    try {
                        returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, -1);
                    } catch (error) {
                        expect(error).to.be.instanceOf(RangeError).and.that.has.property("message", "Page should start at 1.");
                        return;
                    }
                    chai.assert.fail(returned, null, "Expected to have thrown error, but returned.");
                });
            });
            context("as a number greater than zero", () => {
                context("and it is greater than the number of pages", () => {
                    it("should not return any orders", async () => {
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 20);
                        // tslint:disable-next-line:no-unused-expression
                        expect(returned).to.be.an("array").that.is.empty;
                    });
                });
                context("and it is the first page", () => {
                    it("should return only items from that page", async () => {
                        const tokenAddress1 = DEFAULT_ADDRESS + TOKENS[0];
                        const tokenAddress2 = DEFAULT_ADDRESS + TOKENS[1];
                        const tokenAddress3 = DEFAULT_ADDRESS + TOKENS[2];
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 1, 2);
                        expect(returned).to.be.an("array").that.has.lengthOf(2);
                        expect(returned.findIndex((pair) => pair.tokenA.address === tokenAddress1 && pair.tokenB.address === tokenAddress2)).to.be.equal(0);
                        expect(returned.findIndex((pair) => pair.tokenA.address === tokenAddress1 && pair.tokenB.address === tokenAddress3)).to.be.equal(1);
                    });
                });
                context("and it is the second page", () => {
                    it("should return only items from that page", async () => {
                        const tokenAddress1 = DEFAULT_ADDRESS + TOKENS[0];
                        const tokenAddress2 = DEFAULT_ADDRESS + TOKENS[1];
                        const tokenAddress3 = DEFAULT_ADDRESS + TOKENS[2];
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 2, 2);
                        expect(returned).to.be.an("array").that.has.lengthOf(2);
                        expect(returned.findIndex((pair) => pair.tokenA.address === tokenAddress2 && pair.tokenB.address === tokenAddress1)).to.be.equal(0);
                        expect(returned.findIndex((pair) => pair.tokenA.address === tokenAddress2 && pair.tokenB.address === tokenAddress3)).to.be.equal(1);
                    });
                });
            });
        });
        context("When perPage is informed", () => {
            context("as a number smaller than 1", () => {
                it("should return error", async () => {
                    let returned;
                    try {
                        returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, undefined, -1);
                    } catch (error) {
                        expect(error).to.be.instanceOf(RangeError).and.that.has.property("message", "The number of itens per page must be greater than or equal to 1.");
                        return;
                    }
                    chai.assert.fail(returned, null, "Expected to have thrown error, but returned.");
                });
            });
            context("as a number greater than zero", () => {
                context("and there is more than one page", () => {
                    context("and the page is 1", () => {
                        it("should return the exact number of pairs of perPage parameter", async () => {
                            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 1, 4);
                            expect(returned).to.be.an("array").that.has.lengthOf(4);
                        });
                    });
                    context("and the page parameter is the last page", () => {
                        it("should return only the remaining pairs", async () => {
                            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 2, 4);
                            expect(returned).to.be.an("array").that.has.lengthOf(2);
                        });
                    });
                });
                context("and there is only one page", () => {
                    it("should return only the remaining pairs", async () => {
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 1, 20);
                        expect(returned).to.be.an("array").that.has.lengthOf(6);
                    });
                });
            });
        });
    });
});
