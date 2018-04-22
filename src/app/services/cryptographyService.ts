import { Order, SignedOrder } from "../models";

export interface CryptographyService {
    signOrder(order: Order): Promise<SignedOrder>;
}
