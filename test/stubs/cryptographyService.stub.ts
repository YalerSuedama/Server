import { Container } from "inversify";
import { CryptographyService, TYPES } from "../../src/app";
import { Order } from "../../src/app/models";

const stub: CryptographyService = {
    signOrder: (order: Order) => Promise.resolve(Object.assign({
        ecSignature: {
            v: 1,
            r: "",
            s: "",
        },
    }, order)),
};

export function stubCryptographyService(iocContainer: Container) {
    iocContainer.bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(stub);
}