import { HttpClient, OrdersRequest, SignedOrder } from "@0xproject/connect";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import { LoggerService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models/";

@injectable()
export class FromRelayerTickerService implements TickerService {

    private static CachedTickers = new ExpirationStrategy(new MemoryStorage());
    private httpClient: HttpClient;
    // private url: string = "https://api.radarrelay.com/0x/v0/"; // "https://api.ercdex.com/api/standard/1/v0/"

    constructor(@inject(TYPES.LoggerService) private logger: LoggerService, @inject(TYPES.TickerRelayerUrl) private url: string) {
        this.logger.setNamespace("fromrelayertickerservice");
        this.httpClient = new HttpClient(this.url);
    }

    public async getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker> {
        const tickerSymbol = this.getTickerSymbol(tokenFrom, tokenTo);
        let value = await FromRelayerTickerService.CachedTickers.getItem<BigNumber>(tickerSymbol);

        if (typeof (value) === "undefined") {
            this.logger.log("Token pair %s was not on cache. Getting from relayer %s.", tickerSymbol, this.url);
            value = await this.getFromRelayer(tokenFrom, tokenTo);

            await FromRelayerTickerService.CachedTickers.setItem(tickerSymbol, value, { ttl: moment.duration(5, "minutes").asSeconds() });
        }

        if (value == null) {
            this.logger.log("Could not find price for ticker %s from relayer %s.", tickerSymbol, this.url);
            return null;
        }
        this.logger.log("Found price of %s for ticker %s from relayer %s.", value.toString(), tickerSymbol, this.url);

        return {
            from: tokenFrom,
            price: value,
            to: tokenTo,
        };
    }

    private async getFromRelayer(tokenFrom: Token, tokenTo: Token): Promise<BigNumber> {
        try {

            if (this.url == null) {
                this.logger.log("Url was not set");
                return null;
            }

            const ordersRequest: OrdersRequest = {
                makerTokenAddress: this.getTokenAddress(tokenFrom),
                takerTokenAddress: this.getTokenAddress(tokenTo),
            };

            const orders: SignedOrder[] = await this.httpClient.getOrdersAsync(ordersRequest);
            if (orders != null && orders.length > 0) {
                return orders[0].takerTokenAmount.dividedBy(orders[0].makerTokenAmount);
            }
        } catch (e) {
            this.logger.log("error trying to get ticker %s from relayer: %o", this.getTickerSymbol(tokenFrom, tokenTo), e);
        }

        return null;
    }

    private getTokenAddress(token: Token): string {
        if (config.get<boolean>("amadeus.ticker.relayer.useTokenAddress")) {
            return token.address;
        }

        const found = config.get<any>(`amadeus.tokens.${token.symbol}`);
        return found ? found.defaultAddress : null;
    }

    private getTickerSymbol(from: Token, to: Token): string {
        return `${from.symbol}-${to.symbol}`;
    }
}
