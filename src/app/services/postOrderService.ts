import { SignedOrder } from "../models";

export interface PostOrderService {
    postOrder(order: SignedOrder): void;
    validateTakerAddress(order: SignedOrder): boolean;
    validateFee(order: SignedOrder): Promise<boolean>;
    validatePrice(order: SignedOrder): Promise<boolean>;
}
