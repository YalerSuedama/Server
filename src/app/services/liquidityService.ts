import { BigNumber } from "bignumber.js";
import { Token, TokenPool } from "../models";

export interface LiquidityService {
    getAvailableAmount(token: Token): Promise<TokenPool>;
    getConvertedAmount(tokenFromAmount: BigNumber, price: BigNumber, tokenFrom: Token, tokenTo: Token): BigNumber;
    getConvertedPrice(tokenFromAmount: BigNumber, tokenToAmount: BigNumber, tokenFrom: Token, tokenTo: Token): BigNumber;
}
