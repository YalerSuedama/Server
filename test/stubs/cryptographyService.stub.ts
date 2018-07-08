import { Container } from "inversify";
import { CryptographyService, TYPES } from "../../src/app";
import { Order, SignedOrder } from "../../src/app/models";

export const cryptographyServiceStub: CryptographyService = {
    isValidSignedOrder: (signedOrder: SignedOrder) => Promise.resolve(true),
    signOrder: (order: Order) => Promise.resolve(Object.assign({
        ecSignature: {
            r: "",
            s: "",
            v: 1,
        },
    }, order)),
};

export function cryptographyServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(cryptographyServiceStub);
}
