import { Container } from "inversify";
import { LoggerService, PaginationService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";
import { LoggerDebug } from "../../src/domain/index";

export const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000";
export const TOKENS = ["TK1", "TK2", "ZRX"];

export function createToken(symbol: string): Token {
    return {
        address: DEFAULT_ADDRESS + symbol,
        decimals: 18,
        symbol,
    };
}

export function createContainer(withPagination: boolean, ...stubs: Array<(iocContainer: Container) => void>): Container {
    const iocContainer = new Container({ defaultScope: "Singleton" });
    iocContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    if (withPagination) {
        iocContainer.bind(PaginationService).toSelf();
    }
    stubs.forEach((stub) => {
        stub(iocContainer);
    });
    return iocContainer;
}
