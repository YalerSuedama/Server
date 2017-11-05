import * as BigNumber from "bignumber.js";
import { Token } from "./token";

export interface TokenPool {
    token: Token;
    availableAmount: BigNumber.BigNumber;
}
