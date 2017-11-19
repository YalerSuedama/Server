import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, OrderService, SaltService, TickerService, TimeService, TokenService, TYPES } from "../../app";
import { Order, Token } from "../../app/models";
import { ReserveManagerOrderService } from "./reserveManagerOrderService";

const chaiThingsLoader = () => require("chai-things");
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
};

const stubFeeService: FeeService = {
    getMakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getTakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getFeeRecipient: (token?: Token) => Promise.resolve(DEFAULT_ADDRESS + "FEE"),
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

const stubSaltService: SaltService = {
    getSalt: () => Promise.resolve("SALT"),
};

const stubTickerService: TickerService = {
    getTicker: (tokenFrom: Token, tokenTo: Token) => Promise.resolve({
        from: tokenFrom,
        to: tokenTo,
        bid: new BigNumber(1),
        ask: new BigNumber(1),
    }),
};

const stubTimeService: TimeService = {
    getExpirationTimestamp: () => "1",
};

const stubTokenService: TokenService = {
    getToken: (symbol: string) => Promise.resolve(createToken(symbol)),
    listAllTokens: () => Promise.resolve(TOKENS.map((symbol) => createToken(symbol))),
};

describe("ReserveManagerOrderService", () => {
    const iocContainer = new Container({ defaultScope: "Singleton" });
    iocContainer.bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    iocContainer.bind<AmadeusService>(TYPES.AmadeusService).toConstantValue(stubAmadeusService);
    iocContainer.bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(stubCryptographyService);
    iocContainer.bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(stubExchangeService);
    iocContainer.bind<FeeService>(TYPES.FeeService).toConstantValue(stubFeeService);
    iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stubLiquidityService);
    iocContainer.bind<SaltService>(TYPES.SaltService).toConstantValue(stubSaltService);
    iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(stubTickerService);
    iocContainer.bind<TimeService>(TYPES.TimeService).toConstantValue(stubTimeService);
    iocContainer.bind<TokenService>(TYPES.TokenService).toConstantValue(stubTokenService);

    context("when tokenA is informed", () => {
        it("should return orders where makerTokenAddress is tokenA", async () => {
            const symbol = TOKENS[0];
            const address = DEFAULT_ADDRESS + symbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(symbol);
            returned.should.include.one.with.property("makerTokenAddress", address);
        });
        it("should return orders where takerTokenAddress is tokenA", async () => {
            const symbol = TOKENS[0];
            const address = DEFAULT_ADDRESS + symbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(symbol);
            returned.should.include.one.with.property("takerTokenAddress", address);
        });
    });
    context("when tokenB is informed", () => {
        it("should return orders where makerTokenAddress is tokenB", async () => {
            const symbol = TOKENS[0];
            const address = DEFAULT_ADDRESS + symbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, symbol);
            returned.should.include.one.with.property("makerTokenAddress", address);
        });
        it("should return orders where takerTokenAddress is tokenB", async () => {
            const symbol = TOKENS[0];
            const address = DEFAULT_ADDRESS + symbol;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(undefined, symbol);
            returned.should.include.one.with.property("takerTokenAddress", address);
        });
    });
    context("when tokenA and tokenB are informed", () => {
        it("should return an order with tokenA and tokenB as makerTokenAddress and takerTokenAddress (in that order)", async () => {
            const symbolA = TOKENS[0];
            const addressA = DEFAULT_ADDRESS + symbolA;
            const symbolB = TOKENS[1];
            const addressB = DEFAULT_ADDRESS + symbolB;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(symbolA, symbolB);
            returned.should.include.one.with.property("makerTokenAddress", addressA).and.property("takerTokenAddress", addressB);
        });
        it("should return an order with tokenA and tokenB as takerTokenAddress and makerTokenAddress (in that order)", async () => {
            const symbolA = TOKENS[0];
            const addressA = DEFAULT_ADDRESS + symbolA;
            const symbolB = TOKENS[1];
            const addressB = DEFAULT_ADDRESS + symbolB;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(symbolA, symbolB);
            returned.should.contain.one.with.property("takerTokenAddress", addressA).and.property("makerTokenAddress", addressB);
        });
        it("should not return an order where makerTokenAddres and takerTokenAddress are not tokenA nor tokenB", async () => {
            const symbolA = TOKENS[0];
            const addressA = DEFAULT_ADDRESS + symbolA;
            const symbolB = TOKENS[1];
            const addressB = DEFAULT_ADDRESS + symbolB;
            const returned = await iocContainer.get<OrderService>(TYPES.OrderService).listOrders(symbolA, symbolB);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((order) => (order.makerTokenAddress !== addressA && order.makerTokenAddress !== addressB) && (order.takerTokenAddress !== addressA && order.takerTokenAddress !== addressB))).to.be.undefined;
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
});
