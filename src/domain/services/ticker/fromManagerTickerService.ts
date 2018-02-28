import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import * as moment from "moment";
import { LoggerService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models/";

@injectable()
export class FromManagerTickerService implements TickerService {

    public constructor(
        @inject(TYPES.TickerFactory) private relayersTickerFactory: (url: string) => TickerService,
        @inject(TYPES.TickerService) @named("CMC") private cmcTickerService: TickerService,
    ) {
    }

    public async getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        const relayerUrls = config.get<any>("amadeus.ticker.relayer.urls");

        const relayerPrice = await this.getRelayersMediumPrice(tokenFrom, tokenTo, relayerUrls);
        const cmcPrice = await this.getPriceFromCoinMarketCap(tokenFrom, tokenTo, relayerPrice.weight);
        const mediumPrice = this.calculateMediumPrice(relayerPrice.price, cmcPrice);

        if (mediumPrice != null) {
            return {
                from: tokenFrom,
                price: mediumPrice,
                to: tokenTo,
            };
        }
        return null;
    }

    private calculateMediumPrice(relayerPrice: BigNumber, cmcPrice: BigNumber): BigNumber {
        if (relayerPrice != null && cmcPrice != null) {
            return relayerPrice.add(cmcPrice);
        }
        if (relayerPrice != null) {
            return relayerPrice;
        }
        if (cmcPrice != null) {
            return cmcPrice;
        }

        return null;
    }

    private async getRelayersMediumPrice(tokenFrom: Token, tokenTo: Token, relayerUrls: any): Promise<any> {
        let mediumPrice: BigNumber = null;
        let totalWeight: number = 0;

        await Promise.all(relayerUrls.map(async (url: any) => {
            const price = await this.getPriceFromRelayer(tokenFrom, tokenTo, url.endpoint, url.weight);
            if (price != null) {
                if (mediumPrice == null) {
                    mediumPrice = new BigNumber(0);
                }
                mediumPrice.add(price);
                totalWeight = totalWeight + url.weight;
            }
        }));

        return {price: mediumPrice, weight: totalWeight};
    }

    private async getPriceFromRelayer(tokenFrom: Token, tokenTo: Token, url: string, weight: number): Promise<BigNumber> {
        const tickerService = this.relayersTickerFactory(url);
        const relayerTicker = await tickerService.getTicker(tokenFrom, tokenTo);

        if (relayerTicker != null) {
            return relayerTicker.price.times(weight);
        }
        return null;
    }

    private async getPriceFromCoinMarketCap(tokenFrom: Token, tokenTo: Token, weight: number): Promise<BigNumber> {
        const cmcTicker = await this.cmcTickerService.getTicker(tokenFrom, tokenTo);
        const cmcWeight = (Math.round(((1 - weight) * 100)) / 100);
        return cmcTicker != null ? cmcTicker.price.times(cmcWeight) : null;
    }
}
