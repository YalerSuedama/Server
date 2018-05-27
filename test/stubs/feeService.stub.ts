import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { FeeService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";
import { DEFAULT_ADDRESS } from "./util";

const stub: FeeService = {
    calculateFee: (exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string) => Promise.resolve(null),
    getFeeRecipient: (token?: Token) => Promise.resolve(DEFAULT_ADDRESS + "FEE"),
    getMakerFee: (token?: Token, amount?: BigNumber) => Promise.resolve(new BigNumber(0)),
    getTakerFee: (token?: Token, amount?: BigNumber) => Promise.resolve(new BigNumber(0)),
};

export function stubFeeService(iocContainer: Container) {
    iocContainer.bind<FeeService>(TYPES.FeeService).toConstantValue(stub);
}
