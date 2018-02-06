import { Container } from "inversify";
import { Token } from "../../src/app/models";
import { LoggerService, TYPES, PaginationService } from "../../src/app/index";
import { LoggerDebug } from "../../src/domain/index";

export const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000";
export const TOKENS = ["TK1", "TK2", "TK3"];

export function createToken(symbol: string): Token {
    return {
        address: DEFAULT_ADDRESS + symbol,
        symbol,
        decimals: 18,
    };
}

export function createContainer(withPagination: boolean, ...stubs: ((iocContainer: Container) => void)[]): Container {
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