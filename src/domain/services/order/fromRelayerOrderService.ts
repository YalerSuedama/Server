import { HttpClient, OrdersRequest, SignedOrder as ZeroExSignedOrder } from "@0xproject/connect";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";
import * as hash from "object-hash";
import { LoggerService, OrderService, TYPES } from "../../../app";
import { SignedOrder } from "../../../app/models";
import * as Util from "../../util";

@injectable()
export class FromRelayerOrderService implements OrderService {

    private static CachedOrders = new ExpirationStrategy(new MemoryStorage());
    private httpClient: HttpClient;

    constructor(@inject(TYPES.LoggerService) private logger: LoggerService, @inject(TYPES.OrderRelayerUrl) private url: string) {
        this.logger.setNamespace("fromrelayerorderservice");
        this.httpClient = new HttpClient(this.url);
    }

    public async listOrders(exchangeContractAddress?: string, tokenAddress?: string, makerTokenAddress?: string, takerTokenAddress?: string, maker?: string, taker?: string, trader?: string, feeRecipient?: string, page?: number, perPage?: number): Promise<SignedOrder[]> {
        const ordersRequest: OrdersRequest = {
            exchangeContractAddress: exchangeContractAddress,
            feeRecipient: feeRecipient,
            maker: maker,
            makerTokenAddress: makerTokenAddress,
            taker: taker,
            takerTokenAddress: takerTokenAddress,
            tokenAddress: tokenAddress,
            trader: trader,
        };
        const filterHash = hash(Object.assign({ url: this.url }, ordersRequest));

        let orders = await FromRelayerOrderService.CachedOrders.getItem<SignedOrder[]>(filterHash);

        if (typeof (orders) === "undefined") {
            this.logger.log("Filter order %s was not on cache. Getting from relayer %s.", filterHash, this.url);
            orders = await this.getFromRelayer(filterHash, ordersRequest, page, perPage);

            const ttlConfig: any = config.get("amadeus.orders.cache.ttl");
            const ttl = moment.duration(ttlConfig.value, ttlConfig.unit);
            this.logger.log("Setting order %s from relayer %s with %s orders on cache for a ttl of %s.", filterHash, this.url, orders && orders.length, ttl.humanize());

            await FromRelayerOrderService.CachedOrders.setItem(filterHash, orders, { ttl: ttl.asSeconds() });
        }

        if (orders == null) {
            this.logger.log("Could not find orders for filter %s from relayer %s.", filterHash, this.url);
            return null;
        }
        this.logger.log("Filter %s of relayer %s has returned %s orders: %o.", filterHash, this.url, orders && orders.length, orders);
        return orders;
    }

    private async getFromRelayer(filterHash: string, ordersRequest: OrdersRequest, page?: number, perPage?: number): Promise<SignedOrder[]> {
        try {
            const orders: ZeroExSignedOrder[] = await this.httpClient.getOrdersAsync(ordersRequest);
            if (orders != null && orders.length > 0) {
                return Util.toAmadeusSignedOrders(orders);
            }
        } catch (e) {
            this.logger.log("error trying to get filter orders %s from relayer %s: %o", filterHash, this.url, e);
        }

        return [];
    }
}
