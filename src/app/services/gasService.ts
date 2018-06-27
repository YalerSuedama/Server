import { BigNumber } from "bignumber.js";

export interface GasService {
    getGasPrice(): Promise<BigNumber>;
    getFillOrderGasLimit(): Promise<BigNumber>;
}