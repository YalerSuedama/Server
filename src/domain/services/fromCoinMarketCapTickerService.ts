import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import * as request from "superagent";
import { LoggerService, TickerService, TYPES } from "../../app";
import { Ticker, Token } from "../../app/models";

@injectable()
export class FromCoinMarketCapTickerService implements TickerService {

    private tokens: any[];

    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("fromcoinmarketcaptickerservice");
        this.tokens = config.get("amadeus.tokens");
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
        const value = await this.getFromCoinMarketCap(token);
        if (value === null) {
            throw new Error(`Could not get the ticker from coinmarketcap to token ${token.symbol}`);
        }
        this.logger.log("Got BTC value for %s: %s.", token.symbol, value.toString());
        return value;
    }

    private async getFromCoinMarketCap(token: Token): Promise<BigNumber> {
        try {
            const tickerId = this.getTokenIdentifier(token);
            const url = `https://api.coinmarketcap.com/v1/ticker/${tickerId}/`;
            this.logger.log("Getting ticker for url %s", url);
            const response = await request.get(url).retry(5);
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
            this.logger.log("Error trying to get ticker %o from coinmarketcap: %o", token, e);
        }

        return null;
    }

    private getTokenIdentifier(token: Token): string {
        const found = this.tokens.find((t) => t.symbol === token.symbol);
        if (found) {
            return found.identifier;
        }
        this.logger.log("The token %s does not have an identifier configured. It cannot be searched on Coin Market Cap", token.symbol);
        throw new Error(`The token ${token.symbol} is not configured to be searched on Coin Market Cap`);
    }
}
