import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { LoggerService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models";

@injectable()
export class FromCacheTickerService implements TickerService {

    private static DEFAULT_TTL = moment.duration(5, "minutes");
    private static CachedTickers = new ExpirationStrategy(new MemoryStorage());

    protected cacheItemTTL: moment.Duration;

    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("tickercache");
        if (config.has("amadeus.ticker.cache.ttl")) {
            const ttlConfig: any = config.get("amadeus.ticker.cache.ttl");
            this.cacheItemTTL = moment.duration(ttlConfig.value, ttlConfig.unit);
        } else {
            this.cacheItemTTL = FromCacheTickerService.DEFAULT_TTL;
        }
    }

    public async addTicker(ticker: Ticker): Promise<void> {
        const tickerKey = this.getTickerKey(ticker.from, ticker.to);
        this.logger.log("Adding ticker %s with price of %s to cache for %s", tickerKey, ticker.price.toString(), this.cacheItemTTL.humanize());
        await FromCacheTickerService.CachedTickers.setItem(tickerKey, ticker, { ttl: this.cacheItemTTL.asSeconds() });
    }

    public async getTicker(from: Token, to: Token): Promise<Ticker> {
        const tickerKey = this.getTickerKey(from, to);
        this.logger.log("Getting ticker for %s", tickerKey);
        const ticker = await FromCacheTickerService.CachedTickers.getItem<Ticker>(tickerKey);
        if (ticker) {
            this.logger.log("Found ticker for %s with a price of %s", tickerKey, ticker.price.toString());
        } else {
            this.logger.log("Did not found a ticker for %s", tickerKey);
        }
        return ticker;
    }

    public async clear(): Promise<void> {
        await FromCacheTickerService.CachedTickers.clear();
    }

    private getTickerKey(from: Token, to: Token) {
        return `${from.symbol}-${to.symbol}`;
    }
}
