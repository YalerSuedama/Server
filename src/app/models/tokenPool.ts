import { Token } from "./token";

export interface TokenPool {
    tokenFrom: Token;
    tokenFromPoolAmount: BigNumber.BigNumber;
    tokenTo: Token;
    tokenToPoolAmount: BigNumber.BigNumber;
}
