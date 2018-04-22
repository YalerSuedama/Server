import { BigNumber } from "bignumber.js";
import { Token } from "../models";

export interface FeeService {
    getMakerFee(token?: Token): Promise<BigNumber>;
    getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber>;
    getFeeRecipient(token?: Token): Promise<string>;
}
