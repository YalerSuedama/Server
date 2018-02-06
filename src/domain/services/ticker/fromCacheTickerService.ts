import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { LoggerService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models";

@injectable()
export class FromCacheTickerService implements TickerService {

    private static CachedTickers = new ExpirationStrategy(new MemoryStorage());

    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("tickercache");
    }

    public async addTicker(ticker: Ticker): Promise<void> {
        const tickerKey = this.getTickerKey(ticker.from, ticker.to);
        const ttlConfig: any = config.get("amadeus.ticker.cache.ttl");
        const ttl = moment.duration(ttlConfig.value, ttlConfig.unit);
        this.logger.log("Adding ticker %s with price of %s to cache for %s", tickerKey, ticker.price.toString(), ttl.humanize());
        await FromCacheTickerService.CachedTickers.setItem(tickerKey, ticker, { ttl: ttl.asSeconds() });
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

    private getTickerKey(from: Token, to: Token) {
        return `${from.symbol}-${to.symbol}`;
    }
}
