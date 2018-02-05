import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import * as request from "superagent";
import { LoggerService, TickerService, TYPES } from "../../app";
import { Ticker, Token } from "../../app/models";

@injectable()
export class FromCoinMarketCapTickerService implements TickerService {

    private static CachedTickers = new ExpirationStrategy(new MemoryStorage());

    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("fromcoinmarketcaptickerservice");
    }

    public async getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        this.logger.log("Getting ticker for %s-%s", tokenFrom.symbol, tokenTo.symbol);
        const fromValueToBTC = await this.getBTCTickerValue(tokenFrom);
        const toValueToBTC = await this.getBTCTickerValue(tokenTo);
        const price = fromValueToBTC.dividedBy(toValueToBTC);
        this.logger.log("Found price for %s-%s as %s", tokenFrom.symbol, tokenTo.symbol, price.toString());
        return {
            from: tokenFrom,
            to: tokenTo,
            price,
        };
    }

    private async getBTCTickerValue(token: Token): Promise<BigNumber> {
        let value = await FromCoinMarketCapTickerService.CachedTickers.getItem<BigNumber>(token.symbol);
        if (typeof (value) === "undefined") {
            this.logger.log("Token %s was not on cache. Getting from cmc.", token.symbol);
            value = await this.getFromCoinMarketCap(token);
            if (value === null) {
                throw new Error(`Could not get the ticker from coinmarketcap to token ${token.symbol}`);
            }
            await FromCoinMarketCapTickerService.CachedTickers.setItem(token.symbol, value, { ttl: moment.duration(5, "minutes").asSeconds() });
        }
        this.logger.log("Got value for %s: %s.", token.symbol, value.toString());
        return value;
    }

    private async getFromCoinMarketCap(token: Token): Promise<BigNumber> {
        try {
            const tickerId = config.get<string>(`amadeus.ticker.${token.symbol}`);
            const url = `https://api.coinmarketcap.com/v1/ticker/${tickerId}/`;
            this.logger.log("Getting ticker for url %s", url);
            const response = await request.get(url);
            if (response
                && response.status
                && response.status === 200
                && response.body) {
                const value = response.body.length ? response.body[0].price_btc : (response.body.price_btc ? response.body.price_btc : null);
                if (value) {
                    return new BigNumber(value);
                }
            }
        } catch (e) {
            this.logger.log("error trying to get ticker %o from coinmarketcap: %o", token, e);
        }

        return null;
    }
}
