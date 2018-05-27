import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { ExchangeService, TYPES } from "../../src/app";
import { SignedOrder, Token } from "../../src/app/models";
import { DEFAULT_ADDRESS } from "./util";

const stub: ExchangeService = {
    ensureAllowance: (amount: BigNumber, tokenAddress: string, spenderAddress: string) => Promise.resolve(),
    fillOrder: (order: SignedOrder, fillerAddress?: string) => Promise.resolve(),
    get0xContractAddress: () => Promise.resolve(DEFAULT_ADDRESS + "ZRX"),
    getBalance: (address: string, token?: Token) => Promise.resolve(new BigNumber(10).pow(15)),
};

export function stubExchangeService(iocContainer: Container) {
    iocContainer.bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(stub);
}