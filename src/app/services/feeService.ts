import { BigNumber } from "bignumber.js";
import { Fee, Token } from "../models";

export interface FeeService {
    getMakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber>;
    getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber>;
    getFeeRecipient(token?: Token): Promise<string>;
    calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee>;
}
