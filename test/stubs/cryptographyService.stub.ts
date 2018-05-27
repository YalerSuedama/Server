import { Container } from "inversify";
import { CryptographyService, TYPES } from "../../src/app";
import { Order, SignedOrder } from "../../src/app/models";

const stub: CryptographyService = {
    isValidSignedOrder: (signedOrder: SignedOrder) => Promise.resolve(true),
    signOrder: (order: Order) => Promise.resolve(Object.assign({
        ecSignature: {
            r: "",
            s: "",
            v: 1,
        },
    }, order)),
};

export function stubCryptographyService(iocContainer: Container) {
    iocContainer.bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(stub);
}
