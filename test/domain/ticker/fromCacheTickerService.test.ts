import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import * as moment from "moment";
import "reflect-metadata";
import { TickerService, TYPES } from "../../../src/app";
import { Ticker, Token } from "../../../src/app/models";
import { FromCacheTickerService } from "../../../src/domain";
import { createContainer, createToken, TOKENS } from "../../stubs/util";
import { delay } from "../../util";

const expect = chai.expect;

class AssignableTTLFromCacheTickerService extends FromCacheTickerService {
    public assignTTL(newTTL: moment.Duration) {
        this.cacheItemTTL = newTTL;
    }
}

describe("FromCacheTickerService", () => {
    const TOKEN_FROM = createToken(TOKENS[0]);
    const TOKEN_TO = createToken(TOKENS[1]);
    const DEFAULT_PRICE = new BigNumber(1);
    const DEFAULT_TICKER: Ticker = { from: TOKEN_FROM, to: TOKEN_TO, price: DEFAULT_PRICE };
    const iocContainer = createContainer(false, (c) => {
        c.bind<TickerService>(TYPES.TickerService).to(AssignableTTLFromCacheTickerService);
    });
    const tickerService = iocContainer.get<TickerService>(TYPES.TickerService) as AssignableTTLFromCacheTickerService;

    beforeEach(async () => {
        await tickerService.clear();
    });

    async function assertTokenNotInCache(from: Token, to: Token): Promise<void> {
        const ticker = await tickerService.getTicker(from, to);
        expect(ticker).to.be.not.ok;
    }

    async function assertTokenInCache(from: Token, to: Token, price: BigNumber): Promise<void> {
        const ticker = await tickerService.getTicker(from, to);
        expect(ticker).to.be.ok;
        expect(ticker.from.symbol).to.be.equal(from.symbol);
        expect(ticker.to.symbol).to.be.equal(to.symbol);
        expect(ticker.price.toString()).to.be.equal(price.toString());
    }

    context("When ticker is not on cache", () => {
        it("Should return null when getting the ticker.", async () => {
            await assertTokenNotInCache(TOKEN_FROM, TOKEN_TO);
        });
        it("Should return the ticker after adding it to the cache", async () => {
            await assertTokenNotInCache(TOKEN_FROM, TOKEN_TO);
            
            await tickerService.addTicker(DEFAULT_TICKER);
            
            await assertTokenInCache(TOKEN_FROM, TOKEN_TO, DEFAULT_PRICE);
        });
    });
    context("When ticker is in the cache", () => {
        beforeEach(async () => {
            await tickerService.addTicker(DEFAULT_TICKER);
        });

        it("Should return the ticker when getting the ticker.", async () => {
            await assertTokenInCache(TOKEN_FROM, TOKEN_TO, DEFAULT_PRICE);
        });
        it("Should return the replaced ticker after adding a new one to the cache.", async () => {
            await assertTokenInCache(TOKEN_FROM, TOKEN_TO, DEFAULT_PRICE);

            const newPrice = new BigNumber(2);
            await tickerService.addTicker({ from: TOKEN_FROM, to: TOKEN_TO, price: newPrice});

            await assertTokenInCache(TOKEN_FROM, TOKEN_TO, newPrice);
        });
        it("Should return null after ticker is expired.", async () => {
            tickerService.assignTTL(moment.duration(500, "ms"));
            const newPrice = new BigNumber(2);
            await tickerService.addTicker({ from: TOKEN_FROM, to: TOKEN_TO, price: newPrice});
            await assertTokenInCache(TOKEN_FROM, TOKEN_TO, newPrice);
            await delay(501);
            await assertTokenNotInCache(TOKEN_FROM, TOKEN_TO);
        });
    });
});
