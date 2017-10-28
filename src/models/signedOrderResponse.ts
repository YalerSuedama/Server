import { ECSignature } from "./ecSignature";
import { OrderResponse } from "./orderResponse";

export interface SignedOrderResponse extends OrderResponse {
    ecSignature: ECSignature;
}
