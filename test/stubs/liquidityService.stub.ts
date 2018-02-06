import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { LiquidityService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";

const stub: LiquidityService = {
    getAvailableAmount: (token: Token) => Promise.resolve({
        token,
        availableAmount: new BigNumber(10),
        maximumAmount: new BigNumber(10),
        minimumAmount: new BigNumber(0),
        precision: 5,
    }),
};

export function stubLiquidityService(iocContainer: Container) {
    iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stub);
}