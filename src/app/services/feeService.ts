export interface FeeService {
    getMakerFee(token?: string): Promise<BigNumber.BigNumber>;
    getTakerFee(token?: string): Promise<BigNumber.BigNumber>;
    getFeeRecipient(token?: string): Promise<string>;
}
