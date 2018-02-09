import { HttpClient, OrdersRequest, SignedOrder } from "@0xproject/connect";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { LoggerService, TickerService, TYPES } from "../../app";
import { Ticker, Token } from "../../app/models/";

@injectable()
export class FromRelayerTickerService implements TickerService {

    private static CachedTickers = new ExpirationStrategy(new MemoryStorage());
    private httpClient: HttpClient;

    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("fromrelayertickerservice");
        this.httpClient = new HttpClient("https://api.radarrelay.com/0x/v0/");
        // this.httpClient = new HttpClient("https://api.ercdex.com/api/standard/1/v0/");
    }

    public async getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        this.logger.log("Getting ticker for %s-%s", tokenFrom.symbol, tokenTo.symbol);
        let value = await FromRelayerTickerService.CachedTickers.getItem<BigNumber>(`${tokenFrom.symbol}-${tokenTo.symbol}`);

        if (typeof (value) === "undefined") {
            this.logger.log("Token pair %s-%s was not on cache. Getting from relayer.", tokenFrom.symbol, tokenTo.symbol);
            value = await this.getFromRelayer(tokenFrom, tokenTo);

            await FromRelayerTickerService.CachedTickers.setItem(`${tokenFrom.symbol}-${tokenTo.symbol}`, value, { ttl: moment.duration(5, "minutes").asSeconds() });
        }

        if (value == null) {
            return null;
        }
        return {
            from: tokenFrom,
            to: tokenTo,
            price: value,
        };
    }

    private async getFromRelayer(tokenFrom: Token, tokenTo: Token): Promise<BigNumber> {
        try {
            const ordersRequest: OrdersRequest = {
                makerTokenAddress: this.getTokenAddress(tokenFrom),
                takerTokenAddress: this.getTokenAddress(tokenTo),
            };

            const orders: SignedOrder[] = await this.httpClient.getOrdersAsync(ordersRequest);
            if (orders != null && orders.length > 0) {
                return orders[0].makerTokenAmount.dividedBy(orders[0].takerTokenAmount);
            }
        } catch (e) {
            this.logger.log("error trying to get ticker %s-%s from relayer: %o", tokenFrom.symbol, tokenTo.symbol, e);
        }

        return null;
    }

    private getTokenAddress(token: Token): string {
        if (config.get<boolean>("amadeus.relayerticker.useTokenAddress")) {
            return token.address;
        }
        return config.get<string>(`amadeus.relayerticker.${token.symbol}`);
    }
}
