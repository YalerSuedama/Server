import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { LiquidityService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";

const stub: LiquidityService = {
    getAvailableAmount: (token: Token) => Promise.resolve({
        token,
        availableAmount: new BigNumber(10).pow(16),
        maximumAmount: new BigNumber(10).pow(15),
        minimumAmount: new BigNumber(10).pow(13),
        precision: 6,
    }),
};

export function stubLiquidityService(iocContainer: Container) {
    iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stub);
}