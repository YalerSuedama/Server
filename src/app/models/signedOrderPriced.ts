import * as BigNumber from "bignumber.js";
import { ECSignature } from "./ecSignature";
import { SignedOrder } from "./signedOrder";

export interface SignedOrderPriced extends SignedOrder {
    price: BigNumber.BigNumber;
}
