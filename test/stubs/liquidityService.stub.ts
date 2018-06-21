import { BigNumber } from "bignumber.js";
import { Container } from "inversify";
import { LiquidityService, TYPES } from "../../src/app";
import { Token } from "../../src/app/models";

const stub: LiquidityService = {
    getAvailableAmount: (token: Token) => Promise.resolve({
        token,
        availableAmount: new BigNumber(10).pow(16),
        maximumAmount: new BigNumber(10).pow(15),
        minimumAmount: new BigNumber(10).pow(13),
        precision: 6,
    }),
    getConvertedAmount: (tokenFromAmount: BigNumber, price: BigNumber, tokenFrom: Token, tokenTo: Token) => {
        const realTokenFromAmount = tokenFromAmount.dividedBy(new BigNumber(Math.pow(10, tokenFrom.decimals)));
        const realTokenToAmount = realTokenFromAmount.mul(price);
        const tokenToAmountToBaseUnit = realTokenToAmount.mul(10 * tokenTo.decimals);

        return tokenToAmountToBaseUnit;
    },
    getConvertedPrice: (tokenFromAmount: BigNumber, tokenToAmount: BigNumber, tokenFrom: Token, tokenTo: Token) => {
        const realTokenFromAmount = tokenFromAmount.dividedBy(tokenFrom.decimals);
        const realTokenToAmount = tokenToAmount.dividedBy(tokenTo.decimals);

        return realTokenFromAmount.dividedBy(realTokenToAmount);
    },
};

export function stubLiquidityService(iocContainer: Container) {
    iocContainer.bind<LiquidityService>(TYPES.LiquidityService).toConstantValue(stub);
}