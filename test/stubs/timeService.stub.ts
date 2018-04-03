import { Container } from "inversify";
import { TimeService, TYPES } from "../../src/app";

const stub: TimeService = {
    getExpirationTimestamp: () => "1",
};

export function stubTimeService(iocContainer: Container) {
    iocContainer.bind<TimeService>(TYPES.TimeService).toConstantValue(stub);
}
