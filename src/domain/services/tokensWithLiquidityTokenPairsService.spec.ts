import { BigNumber } from "bignumber.js";
import { expect, use } from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { LiquidityService, TickerService, TokenPairsService, TokenService, TYPES } from "../../app";
import { Ticker, Token, TokenPool } from "../../app/models";
import { TokensWithLiquidityTokenPairsService } from "./tokensWithLiquidityTokenPairsService";

use(sinonChai);

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
        bid: new BigNumber(1),
        ask: new BigNumber(1.01),
    }),
};

const iocContainer = new Container({ defaultScope: "Singleton" });
iocContainer.bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stubLiquidityService);
iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(stubTickerService);
iocContainer.bind<TokenService>(TYPES.TokenService).toConstantValue(stubTokenService);

describe("TokensWithLiquidityTokenPairsService", () => {
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
            expect(returned.find((pair) => pair.tokenA.address === address)).to.not.be.null;
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenB.address === address)).to.not.be.null;
        });
    });
    context("When tokenB is informed", () => {
        it("returns pairs with tokenB as left-hand side or right-hand side of pair.", async () => {
            const symbol = TOKENS[1];
            const address = DEFAULT_ADDRESS + symbol;
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(null, symbol);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenA.address === address)).to.not.be.null;
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenB.address === address)).to.not.be.null;
        });
    });
    context("When tokenA and tokenB are informed", () => {
        it("returns pairs with at least one of the tokens and the other token of the pair is tokenC.", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[0], TOKENS[1]);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[2])).to.not.be.null;
        });
        it("returns pairs with tokenA and tokenB as one of the pairs (in that order).", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[0], TOKENS[1]);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenA.address === DEFAULT_ADDRESS + TOKENS[0] && pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[1])).to.not.be.null;
        });
        it("returns pairs with tokenA and tokenB as one of the pairs (in reversed order).", async () => {
            const returned = await iocContainer.get<TokenPairsService>(TYPES.TokenPairsService).listPairs(TOKENS[1], TOKENS[0]);
            // tslint:disable-next-line:no-unused-expression
            expect(returned.find((pair) => pair.tokenA.address === DEFAULT_ADDRESS + TOKENS[0] && pair.tokenB.address === DEFAULT_ADDRESS + TOKENS[1])).to.not.be.null;
        });
    });
});
