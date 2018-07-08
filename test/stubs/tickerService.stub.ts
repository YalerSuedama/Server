import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { TickerService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";
import { TOKENS } from "./util";

export const tickerServiceStub: TickerService = {
    getTicker: (tokenFrom: Token, tokenTo: Token) => Promise.resolve({
        from: tokenFrom,
        price: new BigNumber(TOKENS.findIndex((token) => token === tokenFrom.symbol) + 1),
        to: tokenTo,
    }),
};

export function tickerServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(tickerServiceStub);
}
