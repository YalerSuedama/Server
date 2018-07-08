import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { AmadeusService, OrderService, TokenPairsService, TYPES, ValidationService } from "../../src/app";
import { ZeroExSchemaBasedValidationService } from "../../src/domain/index";
import { ReserveManagerOrderService } from "../../src/domain/services/reserveManagerOrderService";
import { amadeusServiceStubFactory, cryptographyServiceStubFactory, exchangeServiceStubFactory, feeServiceStubFactory, liquidityServiceStubFactory, saltServiceStubFactory, tickerServiceStubFactory, timeServiceStubFactory, tokenPairsServiceStubFactory, tokenServiceStubFactory } from "../stubs";
import { createContainer, createToken, DEFAULT_ADDRESS, TOKENS } from "../stubs/util";

const chaiSubsetLoader = () => require("chai-subset");
const chaiThingsLoader = () => require("chai-things");
chai.use(chaiSubsetLoader());
chai.use(chaiThingsLoader());
const should = chai.should();
const expect = chai.expect;

describe("ReserveManagerOrderService", () => {
    const iocContainer = createContainer(true, amadeusServiceStubFactory, cryptographyServiceStubFactory, exchangeServiceStubFactory, feeServiceStubFactory, liquidityServiceStubFactory, saltServiceStubFactory, tickerServiceStubFactory, timeServiceStubFactory, tokenPairsServiceStubFactory, tokenServiceStubFactory, (c: Container) => {
        c.bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
        c.bind<ValidationService>(TYPES.ValidationService).to(ZeroExSchemaBasedValidationService);
    });

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
                const makerAddress = iocContainer.get<AmadeusService>(TYPES.AmadeusService).getMainAddress();
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
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
            it("should return all orders with the taker filled with the Zero address", async () => {
                const nullAddressSymbol = "000";
                const takerAddress = DEFAULT_ADDRESS + nullAddressSymbol;
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, takerAddress);
                returned.should.all.have.property("taker", takerAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as NOT the null address", () => {
            it("should return all orders with the taker address filled with the taker", async () => {
                const takerSymbol = TOKENS[0];
                const takerAddress = DEFAULT_ADDRESS + takerSymbol;
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, takerAddress);
                returned.should.all.have.property("taker", takerAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
    });
    context("when trader is informed", () => {
        context("as the Amadeus address", async () => {
            it("should return all orders", async () => {
                const traderAddress = iocContainer.get<AmadeusService>(TYPES.AmadeusService).getMainAddress();
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                returned.should.all.have.property("maker", traderAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as the null address", () => {
            it("should return all orders with the taker address filled with the Zero address", async () => {
                const nullAddressSymbol = "000";
                const traderAddress = DEFAULT_ADDRESS + nullAddressSymbol;
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                returned.should.all.have.property("taker", traderAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
        context("as NOT the Amadeus address NOR the null address", () => {
            it("should return orders with the taker address filled with the trader", async () => {
                const traderSymbol = TOKENS[0];
                const traderAddress = DEFAULT_ADDRESS + traderSymbol;
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
                const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, undefined, undefined, undefined, undefined, undefined, traderAddress);
                returned.should.all.have.property("taker", traderAddress);
                expect(returned).to.be.an("array").that.has.lengthOf(expectedLength);
            });
        });
    });
    context("When feeRecipient is informed", () => {
        context("As the Amadeus fee address", () => {
            it("should return all orders", async () => {
                const feeAddress = iocContainer.get<AmadeusService>(TYPES.AmadeusService).getFeeAddress();
                const expectedLength = (await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs()).length;
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
        // TODO: Fernanda - Test will break with decimals alteration
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
