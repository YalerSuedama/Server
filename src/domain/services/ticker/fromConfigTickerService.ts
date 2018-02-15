import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import { TickerService } from "../../../app";
import { Ticker, Token } from "../../../app/models";

@injectable()
export class FromConfigTickerService implements TickerService {

    public getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        const key = `amadeus.ticker.fixedPairs.${tokenFrom.symbol}-${tokenTo.symbol}`;
        if (config.has(key)) {
            return Promise.resolve({
                from: tokenFrom,
                to: tokenTo,
                price: new BigNumber(config.get(`${key}.price`) as string),
            });
        }
        const reversedKey = `amadeus.ticker.fixedPairs.${tokenTo.symbol}-${tokenFrom.symbol}`;
        if (config.has(reversedKey)) {
            const price = new BigNumber(config.get(`${reversedKey}.price`));
            return Promise.resolve({
                from: tokenFrom,
                to: tokenTo,
                price: new BigNumber(1).dividedBy(price),
            });
        }
        return null;
    }
}
