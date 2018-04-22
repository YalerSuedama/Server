import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { FeeService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";
import { DEFAULT_ADDRESS } from "./util";

const stub: FeeService = {
    getMakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getTakerFee: (token?: Token) => Promise.resolve(new BigNumber(0)),
    getFeeRecipient: (token?: Token) => Promise.resolve(DEFAULT_ADDRESS + "FEE"),
};

export function stubFeeService(iocContainer: Container) {
    iocContainer.bind<FeeService>(TYPES.FeeService).toConstantValue(stub);
}
