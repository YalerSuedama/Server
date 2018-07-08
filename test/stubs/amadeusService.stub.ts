import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { AmadeusService, TYPES } from "../../src/app";
import { DEFAULT_ADDRESS } from "./util";

export const amadeusServiceStub: AmadeusService = {
    getFeeAddress: () => DEFAULT_ADDRESS + "FEE",
    getMainAddress: () => DEFAULT_ADDRESS + "ADD",
    getMinimumAmount: () => new BigNumber("1000000"),
    getPrecision: () => 6,
};

export function amadeusServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<AmadeusService>(TYPES.AmadeusService).toConstantValue(amadeusServiceStub);
}
