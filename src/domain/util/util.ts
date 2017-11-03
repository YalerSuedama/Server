import * as BigNumber from "bignumber.js";
import * as _ from "lodash";

export function toBaseUnit(value: number, decimals?: number) {
    if (_.isUndefined(decimals)) {
        decimals = 18;
    }

    const toUnit = new BigNumber(10).pow(decimals);
    const baseUnitAmount = new BigNumber(value).times(toUnit);
    return baseUnitAmount;
}
