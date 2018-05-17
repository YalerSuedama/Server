import { BigNumber } from "bignumber.js";

export interface ValidationService {
    isAddress(address: string): boolean;
    isWhitelistedAddress(address: string, activeOnly?: boolean): Promise<boolean>;
    validateMainAddress(address: string, allowZero: boolean): boolean;
    validateFee(makerTokenAddress: string, makerFee: BigNumber, makerTokenAmount: BigNumber): Promise<boolean>;
    validatePrice(makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber, takerTokenAmount: BigNumber): Promise<boolean>;
    validateCurrentContractAddress(address: string): Promise<boolean>;
    tokenPairIsSupported(makerTokenAddress: string, takerTokenAddress: string): Promise<boolean>;
    validateMakerTokenAmount(makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber): Promise<boolean>;
    validateTakerTokenAmount(makerTokenAddress: string, takerTokenAddress: string, takerTokenAmount: BigNumber): Promise<boolean>;
}
