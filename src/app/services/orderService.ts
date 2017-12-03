import { SignedOrder } from "../models";

export interface OrderService {
    listOrders(
        exchangeContractAddress?: string,
        tokenAddress?: string,
        makerTokenAddress?: string,
        takerTokenAddress?: string,
        tokenA?: string,
        tokenB?: string,
        maker?: string,
        taker?: string,
        trader?: string,
        feeRecipient?: string): Promise<SignedOrder[]>;
}
