import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import * as moment from "moment";
import { LoggerService, TickerService, TYPES, UrlTickerService } from "../../../app";
import { Ticker, Token } from "../../../app/models/";

@injectable()
export class FromManagerTickerService implements TickerService {

    public constructor(
        @inject(TYPES.UrlTickerService) @named("Relayer") private relayerTickerService: UrlTickerService,
        @inject(TYPES.TickerService) @named("CMC") private cmcTickerService: TickerService,
    ) {
    }

    public async getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        const relayerTicker = await this.relayerTickerService.getTicker(tokenFrom, tokenTo);
        const cmcTicker = await this.cmcTickerService.getTicker(tokenFrom, tokenTo);

        if (relayerTicker == null || cmcTicker == null) {
            return null;
        }

        const value = relayerTicker.price.times(new BigNumber(0.8)).add(cmcTicker.price.times(new BigNumber(0.2)));
        return {
            from: tokenFrom,
            price: value,
            to: tokenTo,
        };
    }
}
