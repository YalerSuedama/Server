import { BigNumber } from "bignumber.js";
import { SignedOrder, Token } from "../models";

export interface ExchangeService {
    get0xContractAddress(): Promise<string>;
    getBalance(address: string, token?: Token): Promise<BigNumber>;
    ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string): Promise<void>;
    fillOrder(order: SignedOrder, fillerAddress?: string): Promise<void>;
}
