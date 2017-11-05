import { BigNumber } from "bignumber.js";

export interface FeeService {
    getMakerFee(token?: string): Promise<BigNumber>;
    getTakerFee(token?: string): Promise<BigNumber>;
    getFeeRecipient(token?: string): Promise<string>;
}
