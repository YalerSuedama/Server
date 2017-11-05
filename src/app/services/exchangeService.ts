import { BigNumber } from "bignumber.js";
import { Token } from "../models";

export interface ExchangeService {
    get0xContractAddress(): Promise<string>;
    getBalance(address: string, token?: Token): Promise<BigNumber>;
}
