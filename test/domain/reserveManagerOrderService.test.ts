import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LoggerService, OrderService, PaginationService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../src/app";
import { Order, Token, TokenPairTradeInfo } from "../../src/app/models";
import { LoggerDebug } from "../../src/domain/services/loggerDebug";
import { ReserveManagerOrderService } from "../../src/domain/services/reserveManagerOrderService";

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
const stubAmadeusService: AmadeusService = {
    getFeeAddress: () => DEFAULT_ADDRESS + "FEE",
    getMainAddress: () => DEFAULT_ADDRESS + "ADD",
};

const stubCryptographyService: CryptographyService = {
    signOrder: (order: Order) => Promise.resolve(Object.assign({
        ecSignature: {
            v: 1,
            r: "",
            s: "",
        },
    }, order)),
};

const stubExchangeService: ExchangeService = {
    get0xContractAddress: () => Promise.resolve(DEFAULT_ADDRESS + "ZRX"),
    getBalance: (address: string, token?: Token) => Promise.resolve(new BigNumber(1)),
    ensureAllowance: (amount: BigNumber, tokenAddress: string, spenderAddress: string) => Promise.resolve(),
};

const stubFeeService: FeeService = {
    getMakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getTakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getFeeRecipient: (token?: Token) => Promise.resolve(DEFAULT_ADDRESS + "FEE"),
};

const stubTokenPairsService: TokenPairsService = {
    listPairs: (tokenA?: string, tokenB?: string) => {
        const tokens = TOKENS.map((token) => createToken(token));
        let pairs: TokenPairTradeInfo[] = [];
        for (const token of tokens) {
            for (const tokenTo of tokens) {
                if (tokenTo !== token) {
                    pairs.push({
                        tokenA: {
                            address: token.address,
                            minAmount: "0",
                            maxAmount: "1",
                            precision: 1,
                        },
                        tokenB: {
                            address: tokenTo.address,
                            minAmount: "0",
                            maxAmount: "1",
                            precision: 1,
                        },
                    });
                }
            }
        }
        if (tokenA) {
            const token = tokens.find((t) => t.symbol === tokenA);
            pairs = pairs.filter((pair) => pair.tokenA.address === token.address || pair.tokenB.address === token.address);
        }
        if (tokenB) {
            const token = tokens.find((t) => t.symbol === tokenB);
            pairs = pairs.filter((pair) => pair.tokenA.address === token.address || pair.tokenB.address === token.address);
        }
        return Promise.resolve(pairs);
    },
};

const stubSaltService: SaltService = {
    getSalt: () => Promise.resolve("SALT"),
};

const stubTickerService: TickerService = {
    getTicker: (tokenFrom: Token, tokenTo: Token) => Promise.resolve({
        from: tokenFrom,
        to: tokenTo,
        bid: new BigNumber(TOKENS.findIndex((token) => token === tokenFrom.symbol)),
        ask: new BigNumber(TOKENS.findIndex((token) => token === tokenFrom.symbol)),
    }),
};

const stubTimeService: TimeService = {
    getExpirationTimestamp: () => "1",
};

const stubTokenService: TokenService = {
    getToken: (symbol: string) => Promise.resolve(createToken(symbol)),
    getTokenByAddress: (address: string) => Promise.resolve(TOKENS.map((symbol) => createToken(symbol)).find((token) => token.address === address)),
    listAllTokens: () => Promise.resolve(TOKENS.map((symbol) => createToken(symbol))),
};

describe("ReserveManagerOrderService", () => {
    const iocContainer = new Container({ defaultScope: "Singleton" });
    iocContainer.bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    iocContainer.bind<AmadeusService>(TYPES.AmadeusService).toConstantValue(stubAmadeusService);
    iocContainer.bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(stubCryptographyService);
    iocContainer.bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(stubExchangeService);
    iocContainer.bind<FeeService>(TYPES.FeeService).toConstantValue(stubFeeService);
    iocContainer.bind<TokenPairsService>(TYPES.TokenPairsService).toConstantValue(stubTokenPairsService);
    iocContainer.bind<SaltService>(TYPES.SaltService).toConstantValue(stubSaltService);
    iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(stubTickerService);
    iocContainer.bind<TimeService>(TYPES.TimeService).toConstantValue(stubTimeService);
    iocContainer.bind<TokenService>(TYPES.TokenService).toConstantValue(stubTokenService);
    iocContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    iocContainer.bind(PaginationService).toSelf();

    context("when exchangeContractAddress is informed", () => {
        it("should not return orders when it differs from current 0x contract address", async () => {
            const exchangeContractAddress = DEFAULT_ADDRESS + "ECA";
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(exchangeContractAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(returned).to.be.an("array").that.is.empty;
        });
    });
    context("When tokenAddress is informed", () => {
        it("should return orders where makerTokenAddress is tokenAddress", async () => {
            const tokenSymbol = TOKENS[0];
            const tokenAddress = DEFAULT_ADDRESS + tokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, tokenAddress);
            returned.should.contain.one.with.property("makerTokenAddress", tokenAddress);
        });
        it("should return orders where takerTokenAddress is tokenAddress", async () => {
            const tokenSymbol = TOKENS[0];
            const tokenAddress = DEFAULT_ADDRESS + tokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, tokenAddress);
            returned.should.contain.one.with.property("takerTokenAddress", tokenAddress);
        });
        it("should not return orders where neither makerTokenAddress nor takerTokenAddress are tokenAddress", async () => {
            const tokenSymbol = TOKENS[0];
            const tokenAddress = DEFAULT_ADDRESS + tokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, tokenAddress);
            const ordersWithoutTokenAddress = returned.filter((order) => order.makerTokenAddress !== tokenAddress && order.takerTokenAddress !== tokenAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(ordersWithoutTokenAddress).to.be.an("array").that.is.empty;
        });
    });
    context("when makerTokenAddress is informed", () => {
        it("should return orders where makerTokenAddress is always the makerTokenAddress informed", async () => {
            const makerTokenSymbol = TOKENS[0];
            const makerTokenAddress = DEFAULT_ADDRESS + makerTokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, makerTokenAddress);
            returned.should.all.have.property("makerTokenAddress", makerTokenAddress);
        });
    });
    context("when takerTokenAddress is informed", () => {
        it("should return orders where takerTokenAddress is always the takerTokenAddress informed", async () => {
            const takerTokenSymbol = TOKENS[0];
            const takerTokenAddress = DEFAULT_ADDRESS + takerTokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, takerTokenAddress);
            returned.should.all.have.property("takerTokenAddress", takerTokenAddress);
        });
    });
    context("when maker is informed", () => {
        context("as the Amadeus address", async () => {
            it("should return all orders", async () => {
                const makerAddress = stubAmadeusService.getMainAddress();
                const expectedLength = (await stubTokenPairsService.listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, makerAddress);
                returned.should.all.have.property("maker", makerAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as NOT the Amadeus address", () => {
            it("should not return any order", async () => {
                const makerAddress = DEFAULT_ADDRESS + TOKENS[0];
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, makerAddress);
                // tslint:disable-next-line:no-unused-expression
                expect(returned).to.be.an("array").that.is.empty;
            });
        });
    });
    context("when taker is informed", () => {
        context("as the null address", () => {
            it("should return all orders", async () => {
                const nullAddressSymbol = "000";
                const takerAddress = DEFAULT_ADDRESS + nullAddressSymbol;
                const expectedLength = (await stubTokenPairsService.listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, takerAddress);
                returned.should.all.have.property("taker", takerAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as NOT the null address", () => {
            it("should not return any order", async () => {
                const takerSymbol = TOKENS[0];
                const takerAddress = DEFAULT_ADDRESS + takerSymbol;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, takerAddress);
                // tslint:disable-next-line:no-unused-expression
                expect(returned).to.be.an("array").that.is.empty;
            });
        });
    });
    context("when trader is informed", () => {
        context("as the Amadeus address", async () => {
            it("should return all orders", async () => {
                const traderAddress = stubAmadeusService.getMainAddress();
                const expectedLength = (await stubTokenPairsService.listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                returned.should.all.have.property("maker", traderAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as the null address", () => {
            it("should return all orders", async () => {
                const nullAddressSymbol = "000";
                const traderAddress = DEFAULT_ADDRESS + nullAddressSymbol;
                const expectedLength = (await stubTokenPairsService.listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                returned.should.all.have.property("taker", traderAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as NOT the Amadeus address NOR the null address", () => {
            it("should not return any order", async () => {
                const traderSymbol = TOKENS[0];
                const traderAddress = DEFAULT_ADDRESS + traderSymbol;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                // tslint:disable-next-line:no-unused-expression
                expect(returned).to.be.an("array").that.is.empty;
            });
        });
    });
    context("When feeRecipient is informed", () => {
        context("As the Amadeus fee address", () => {
            it("should return all orders", async () => {
                const feeAddress = stubAmadeusService.getFeeAddress();
                const expectedLength = (await stubTokenPairsService.listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, feeAddress);
                returned.should.all.have.property("feeRecipient", feeAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("As NOT the Amadeus fee address", () => {
            it("should not return any order", async () => {
                const feeAddress = DEFAULT_ADDRESS + TOKENS[0];
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, feeAddress);
                // tslint:disable-next-line:no-unused-expression
                expect(returned).to.be.an("array").that.is.empty;
            });
        });
    });
    context("When makerTokenAddress and takerTokenAddress are informed", () => {
        it("should return orders sorted by price", async () => {
            const makerTokenSymbol = TOKENS[0];
            const makerTokenAddress = DEFAULT_ADDRESS + makerTokenSymbol;
            const takerTokenSymbol = TOKENS[1];
            const takerTokenAddress = DEFAULT_ADDRESS + takerTokenSymbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, makerTokenAddress, takerTokenAddress);
            returned.forEach((order, index) => {
                if (index === 0) {
                    return;
                }
                const orderBefore = returned[index - 1];
                const orderBeforePrice = new BigNumber(orderBefore.takerTokenAmount).dividedBy(new BigNumber(orderBefore.makerTokenAmount));
                const orderPrice = new BigNumber(order.takerTokenAmount).dividedBy(new BigNumber(order.makerTokenAmount));
                expect(orderPrice.toNumber()).to.be.greaterThan(orderBeforePrice.toNumber());
            });
        });
    });
    context("When page is informed", () => {
        context("as a number smaller than 1", () => {
            it("should return error", async () => {
                let returned;
                try {
                    returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, -1);
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
                    const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 20);
                    // tslint:disable-next-line:no-unused-expression
                    expect(returned).to.be.an("array").that.is.empty;
                });
            });
            context("and it is the first page", () => {
                it("should return only items from that page", async () => {
                    const tokenAddress1 = DEFAULT_ADDRESS + TOKENS[0];
                    const tokenAddress2 = DEFAULT_ADDRESS + TOKENS[1];
                    const tokenAddress3 = DEFAULT_ADDRESS + TOKENS[2];
                    const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 2);
                    expect(returned).to.be.an("array").that.has.lengthOf(2);
                    expect(returned.findIndex((order) => order.makerTokenAddress === tokenAddress1 && order.takerTokenAddress === tokenAddress2)).to.be.equal(0);
                    expect(returned.findIndex((order) => order.makerTokenAddress === tokenAddress1 && order.takerTokenAddress === tokenAddress3)).to.be.equal(1);
                });
            });
            context("and it is the second page", () => {
                it("should return only items from that page", async () => {
                    const tokenAddress1 = DEFAULT_ADDRESS + TOKENS[0];
                    const tokenAddress2 = DEFAULT_ADDRESS + TOKENS[1];
                    const tokenAddress3 = DEFAULT_ADDRESS + TOKENS[2];
                    const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 2, 2);
                    expect(returned).to.be.an("array").that.has.lengthOf(2);
                    expect(returned.findIndex((order) => order.makerTokenAddress === tokenAddress2 && order.takerTokenAddress === tokenAddress1)).to.be.equal(0);
                    expect(returned.findIndex((order) => order.makerTokenAddress === tokenAddress2 && order.takerTokenAddress === tokenAddress3)).to.be.equal(1);
                });
            });
        });
    });
    context("When perPage is informed", () => {
        context("as a number smaller than 1", () => {
            it("should return error", async () => {
                let returned;
                try {
                    returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, -1);
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
                        const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 4);
                        expect(returned).to.be.an("array").that.has.lengthOf(4);
                    });
                });
                context("and the page parameter is the last page", () => {
                    it("should return only the remaining orders", async () => {
                        const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 2, 4);
                        expect(returned).to.be.an("array").that.has.lengthOf(2);
                    });
                });
            });
            context("and there is only one page", () => {
                it("should return only the remaining orders", async () => {
                    const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 20);
                    expect(returned).to.be.an("array").that.has.lengthOf(6);
                });
            });
        });
    });
});
