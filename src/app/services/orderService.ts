import { SignedOrder } from "../models";

export interface OrderService {
    listOrders(
        exchangeContractAddress?: string,
        tokenAddress?: string,
        makerTokenAddress?: string,
        takerTokenAddress?: string,
        tokenA?: string,
        tokenB?: string): Promise<SignedOrder[]>;
}
