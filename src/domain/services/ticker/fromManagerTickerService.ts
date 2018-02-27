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
        const relayerUrls = config.get<any>("amadeus.ticker.relayer.urls");

        const relayerPrice = await this.getRelayersMediumPrice(tokenFrom, tokenTo, relayerUrls);
        const cmcPrice = await this.getPriceFromCoinMarketCap(tokenFrom, tokenTo, this.getCmcWeight(relayerUrls));

        return {
            from: tokenFrom,
            price: relayerPrice.add(cmcPrice),
            to: tokenTo,
        };
    }

    private async getRelayersMediumPrice(tokenFrom: Token, tokenTo: Token, relayerUrls: any): Promise<BigNumber> {
        const mediumPrice: BigNumber = new BigNumber(0);

        await Promise.all(relayerUrls.map(async (url: any) => {
            const price = await this.getPriceFromRelayer(tokenFrom, tokenTo, url.endpoint, url.weight);
            mediumPrice.add(price);
        }));

        return mediumPrice;
    }

    private async getPriceFromRelayer(tokenFrom: Token, tokenTo: Token, url: string, weight: number): Promise<BigNumber> {
        this.relayerTickerService.setUrl(url);
        const relayerTicker = await this.relayerTickerService.getTicker(tokenFrom, tokenTo);
        return relayerTicker != null ? relayerTicker.price.times(weight) : new BigNumber(0);
    }

    private async getPriceFromCoinMarketCap(tokenFrom: Token, tokenTo: Token, weight: number): Promise<BigNumber> {
        const cmcTicker = await this.cmcTickerService.getTicker(tokenFrom, tokenTo);
        return cmcTicker != null ? cmcTicker.price.times(weight) : new BigNumber(0);
    }

    private getCmcWeight(relayerUrls: any): number {
        let weight: number = 0;

        for (const url of relayerUrls) {
            weight += url.weight;
        }
        return Math.round(((1 - weight) * 100)) / 100;
    }
}
