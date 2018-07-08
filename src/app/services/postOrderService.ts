import { SignedOrder } from "../models";

export interface PostOrderService {
    postOrder(order: SignedOrder): Promise<void>;
}
