import * as BigNumber from "bignumber.js";
import { Token } from "./token";

export interface Ticker {
    from: Token;
    to: Token;
    price: BigNumber.BigNumber;
}
