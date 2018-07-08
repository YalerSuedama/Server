import { Container } from "inversify";
import { TYPES, WhitelistService } from "../../src/app";
import { BLOCKED_ADDRESS, createToken, TOKENS } from "./util";

export const whitelistServiceStub: WhitelistService = {
    exists: (address: string) => Promise.resolve(address !== BLOCKED_ADDRESS),
};

export function whitelistStubFactory(iocContainer: Container) {
    iocContainer.bind<WhitelistService>(TYPES.WhitelistService).toConstantValue(whitelistServiceStub);
}
