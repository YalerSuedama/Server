import { BigNumber } from "bignumber.js";

export interface ValidationService {
    isAddress(address: string): boolean;
    validateMainAddress(address: string, allowZero: boolean): boolean;
    validateFee(makerTokenAddress: string, makerFee: BigNumber, makerTokenAmount: BigNumber): Promise<boolean>;
    validatePrice(makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber, takerTokenAmount: BigNumber): Promise<boolean>;
    validateCurrentContractAddress(address: string): Promise<boolean>;
    tokenPairIsSupported(tokenBoughtAddress: string, tokenSoldAddress: string): Promise<boolean>;
    validateTokenSoldAmount(tokenSoldAddress: string, tokenBoughtAddress: string, tokenSoldAmount: BigNumber): Promise<boolean>;
    validateTokenBoughtAmount(tokenBoughtAddress: string, tokenSoldAddress: string, tokenBoughtAmount: BigNumber): Promise<boolean>;
}
