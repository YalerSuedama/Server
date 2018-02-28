import { BigNumber } from "bignumber.js";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function toBaseUnit(value: BigNumber | number, decimals?: number): BigNumber {
    if (!decimals) {
        decimals = 18;
    }

    return new BigNumber(value).times(new BigNumber(10).pow(decimals));
}

export function flatten<T>(array: T[][], removeNulls?: boolean): T[] {
    if (!removeNulls) {
        removeNulls = true;
    }
    return !array || array.length === 0 ? [] : array.reduce((result, a) => {
        if (!result || result.length === 0) {
            result = [];
        }
        return result.concat(a);
    }).filter((el) => !removeNulls || el);
}
