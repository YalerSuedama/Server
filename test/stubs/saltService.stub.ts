import { Container } from "inversify";
import { SaltService, TYPES } from "../../src/app";

const stub: SaltService = {
    getSalt: () => Promise.resolve("SALT"),
};

export function stubSaltService(iocContainer: Container) {
    iocContainer.bind<SaltService>(TYPES.SaltService).toConstantValue(stub);
}
