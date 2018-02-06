import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { TickerService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";
import { TOKENS } from "./util";

const stub: TickerService = {
    getTicker: (tokenFrom: Token, tokenTo: Token) => Promise.resolve({
        from: tokenFrom,
        to: tokenTo,
        price: new BigNumber(TOKENS.findIndex((token) => token === tokenFrom.symbol)),
    }),
};

export function stubTickerService(iocContainer: Container) {
    iocContainer.bind<TickerService>(TYPES.TickerService).toConstantValue(stub);
}
