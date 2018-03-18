import * as config from "config";
import { inject, injectable, named } from "inversify";
import { LoggerService, OrderService, TokenService, TYPES } from "../../../app";
import { SignedOrder } from "../../../app/models";

@injectable()
export class ManagerOrderService implements OrderService {

    constructor(
        @inject(TYPES.LoggerService) private logger: LoggerService,
        @inject(TYPES.OrderService) @named("Amadeus") private amadeusOrderService: OrderService,
        @inject(TYPES.OrderFactory) private relayersOrderFactory: (url: string) => OrderService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
    ) {
        this.logger.setNamespace("managerorderservice");
    }

    public async listOrders(exchangeContractAddress?: string, tokenAddress?: string, makerTokenAddress?: string, takerTokenAddress?: string, maker?: string, taker?: string, trader?: string, feeRecipient?: string, page?: number, perPage?: number): Promise<SignedOrder[]> {
        let orders: SignedOrder[] = [];
        if (config.get<boolean>("amadeus.orders.sources.relayers.enabled")) {
            const urls: string[] = config.get("amadeus.orders.sources.relayers.urls");
            for (const url of urls) {
                const orderService = this.relayersOrderFactory(url);
                try {
                    const relayerOrders = await orderService.listOrders(exchangeContractAddress, tokenAddress, makerTokenAddress, takerTokenAddress, maker, taker, trader, feeRecipient, page, perPage);
                    orders = orders.concat(relayerOrders);
                } catch (e) {
                    this.logger.log(e.message);
                }
            }
        }
        if (config.get<boolean>("amadeus.orders.sources.amadeus.enabled")) {
            orders = orders.concat(await this.amadeusOrderService.listOrders(exchangeContractAddress, tokenAddress, makerTokenAddress, takerTokenAddress, maker, taker, trader, feeRecipient, page, perPage));
        }

        return orders;
    }
}
