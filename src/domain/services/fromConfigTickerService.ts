import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import { TickerService } from "../../app";
import { Ticker, Token } from "../../app/models";

@injectable()
export class FromConfigTickerService implements TickerService {

    public getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        const key = `amadeus.ticker.${tokenFrom.symbol}-${tokenTo.symbol}`;
        if (config.has(key)) {
            return Promise.resolve({
                from: tokenFrom,
                to: tokenTo,
                bid: new BigNumber(config.get(`${key}.bid`) as string),
                ask: new BigNumber(config.get(`${key}.ask`) as string),
            });
        }
        const reversedKey = `amadeus.ticker.${tokenTo.symbol}-${tokenFrom.symbol}`;
        if (config.has(reversedKey)) {
            const bid = new BigNumber(config.get(`${reversedKey}.bid`));
            const ask = new BigNumber(config.get(`${reversedKey}.ask`));
            return Promise.resolve({
                from: tokenFrom,
                to: tokenTo,
                bid: new BigNumber(1).dividedBy(bid),
                ask: new BigNumber(1).dividedBy(ask),
            });
        }
        return null;
    }
}
