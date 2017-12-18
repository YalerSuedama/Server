import { ECSignature } from "./ecSignature";
import { Order } from "./order";

export interface SignedOrder extends Order {
    ecSignature: ECSignature;
}
