import { Container } from "inversify";
import { SaltService, TYPES } from "../../src/app";

export const saltServiceStub: SaltService = {
    getSalt: () => Promise.resolve("SALT"),
};

export function saltServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<SaltService>(TYPES.SaltService).toConstantValue(saltServiceStub);
}
