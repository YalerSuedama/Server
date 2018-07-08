import { BigNumber } from "bignumber.js";

export interface AmadeusService {
    getPrecision(): number;
    getFeeAddress(): string;
    getMainAddress(): string;
    getMinimumAmount(): BigNumber;
}
