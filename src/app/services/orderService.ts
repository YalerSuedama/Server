import { SignedOrder } from "../models";

export interface OrderService {
    listOrders(tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string): Promise<SignedOrder[]>;
}
