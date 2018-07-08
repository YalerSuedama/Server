import { Container } from "inversify";
import { TimeService, TYPES } from "../../src/app";

export const timeServiceStub: TimeService = {
    getExpirationTimestamp: () => "1",
};

export function timeServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<TimeService>(TYPES.TimeService).toConstantValue(timeServiceStub);
}
