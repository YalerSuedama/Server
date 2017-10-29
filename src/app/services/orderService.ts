import { SignedOrder } from "../models";

export interface OrderService {
    listOrders(tokenA?: string, tokenB?: string): Promise<SignedOrder[]>;
}
