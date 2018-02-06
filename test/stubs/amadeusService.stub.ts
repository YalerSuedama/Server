import { Container } from "inversify";
import { AmadeusService, TYPES } from "../../src/app";
import { DEFAULT_ADDRESS } from "./util";

const stub: AmadeusService = {
    getFeeAddress: () => DEFAULT_ADDRESS + "FEE",
    getMainAddress: () => DEFAULT_ADDRESS + "ADD",
};

export function stubAmadeusService(iocContainer: Container) {
    iocContainer.bind<AmadeusService>(TYPES.AmadeusService).toConstantValue(stub);
}