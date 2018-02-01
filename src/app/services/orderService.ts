import { SignedOrder } from "../models";

export interface OrderService {
    listOrders(
        exchangeContractAddress?: string,
        tokenAddress?: string,
        makerTokenAddress?: string,
        takerTokenAddress?: string,
        maker?: string,
        taker?: string,
        trader?: string,
        feeRecipient?: string,
        page?: number,
        perPage?: number): Promise<SignedOrder[]>;
}
