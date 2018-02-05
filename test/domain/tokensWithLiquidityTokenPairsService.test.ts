import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { LiquidityService, LoggerService, PaginationService, TickerService, TokenPairsService, TokenService, TYPES } from "../../src/app";
import { Ticker, Token, TokenPool } from "../../src/app/models";
import { LoggerDebug } from "../../src/domain/services/loggerDebug";
import { TokensWithLiquidityTokenPairsService } from "../../src/domain/services/tokensWithLiquidityTokenPairsService";

const chaiSubsetLoader = () => require("chai-subset");
const chaiThingsLoader = () => require("chai-things");
chai.use(chaiSubsetLoader());
chai.use(chaiThingsLoader());
const should = chai.should();
const expect = chai.expect;

const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000";
const TOKENS = ["TK1", "TK2", "TK3"];

function createToken(symbol: string): Token {
    return {
        address: DEFAULT_ADDRESS + symbol,
        symbol,
        decimals: 18,
    };
}

const stubTokenService: TokenService = {
    getToken: (symbol: string) => Promise.resolve(createToken(symbol)),
    getTokenByAddress: (address: string) => Promise.resolve(TOKENS.map((symbol) => createToken(symbol)).find((token) => token.address === address)),
    listAllTokens: () => Promise.resolve(TOKENS.map((symbol) => createToken(symbol))),
};

const stubLiquidityService: LiquidityService = {
    getAvailableAmount: (token: Token) => Promise.resolve({
        token,
        availableAmount: new BigNumber(10),
        maximumAmount: new BigNumber(10),
        minimumAmount: new BigNumber(0),
        precision: 5,
    }),
};

const stubTickerService: TickerService = {
    getTicker: (tokenFrom: Token, tokenTo: Token) => Promise.resolve({
        from: tokenFrom,
        to: tokenTo,
        price: new BigNumber(1.01),
    }),
};

describe("TokensWithLiquidityTokenPairsService", () => {
    const iocContainer = new Container({ defaultScope: "Singleton" });
    iocContainer.bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stubLiquidityService);
    iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(stubTickerService);
    iocContainer.bind<TokenService>(TYPES.TokenService).toConstantValue(stubTokenService);
    iocContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    iocContainer.bind(PaginationService).toSelf();

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
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(symbol);
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
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(null, symbol);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenA.address === address)).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenB.address === address)).to.be.ok;
        });
    });
    context("When tokenA and tokenB are informed", () => {
        it("returns pairs with at least one of the tokens and the other token of the pair is tokenC.", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[0], TOKENS[1]);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[2])).to.be.ok;
        });
        it("returns pairs with tokenA and tokenB as one of the pairs (in that order).", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[0], TOKENS[1]);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenA.address === DEFAULT_ADDRESS + TOKENS[0] && pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[1])).to.be.ok;
        });
        it("returns pairs with tokenA and tokenB as one of the pairs (in reversed order).", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[1], TOKENS[0]);
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
                    expect(returned.findIndex((pair) => pair.tokenA.address === tokenAddress3 && pair.tokenB.address === tokenAddress1)).to.be.equal(1);
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
                    it("should return the exact number of orders of perPage parameter", async () => {
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 1, 4);
                        expect(returned).to.be.an("array").that.has.lengthOf(4);
                    });
                });
                context("and the page parameter is the last page", () => {
                    it("should return only the remaining orders", async () => {
                        const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 2, 8);
                        expect(returned).to.be.an("array").that.has.lengthOf(4);
                    });
                });
            });
            context("and there is only one page", () => {
                it("should return only the remaining orders", async () => {
                    const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(undefined, undefined, 1, 20);
                    expect(returned).to.be.an("array").that.has.lengthOf(12);
                });
            });
        });
    });
});
