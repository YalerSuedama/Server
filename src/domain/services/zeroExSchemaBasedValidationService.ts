import { schemas, SchemaValidator, ValidatorResult } from "@0xproject/json-schemas";
import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { AmadeusService, ExchangeService, FeeService, TickerService, TokenPairsService, TokenService, TYPES, ValidationService } from "../../app";
import { TokenPairTradeInfo } from "../../app/models";

@injectable()
export class ZeroExSchemaBasedValidationService implements ValidationService {

    private validator = new SchemaValidator();
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService,
                 @inject(TYPES.FeeService) @named("ConstantQuote") private feeService: FeeService,
                 @inject(TYPES.TokenService) private tokenService: TokenService,
                 @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService,
                 @inject(TYPES.ExchangeService) protected exchangeService: ExchangeService,
                 @inject(TYPES.TokenPairsService) protected tokenPairsService: TokenPairsService,
                ) {
    }

    public isAddress(address: string): boolean {
        const validatorResult: ValidatorResult = this.validator.validate(address, schemas.addressSchema);
        return validatorResult.valid;
    }

    public validateMainAddress(address: string): boolean {
        return address === this.amadeusService.getMainAddress();
    }

    public async validateFee(makerTokenAddress: string, makerFee: BigNumber): Promise<boolean> {
        const token = await this.tokenService.getTokenByAddress(makerTokenAddress);
        const amadeusFee = await this.feeService.getMakerFee(token);
        return amadeusFee <= makerFee;
    }
    public async validatePrice(makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber, takerTokenAmount: BigNumber): Promise<boolean> {
        const makerToken = await this.tokenService.getTokenByAddress(makerTokenAddress);
        const takerToken = await this.tokenService.getTokenByAddress(takerTokenAddress);
        const ticker = await this.tickerService.getTicker(makerToken, takerToken);
        const orderPrice = makerTokenAmount.dividedBy(takerTokenAmount);
        return ticker.price.comparedTo(orderPrice) >= 1;
    }

    public async validateCurrentContractAddress(address: string): Promise<boolean> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();
        return !address || address === currentContractAddress;
    }

    public async tokenPairIsSupported(makerTokenAddress: string, takerTokenAddress: string): Promise<boolean> {
        const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(makerTokenAddress, takerTokenAddress);
        return pair !== undefined;
    }

    public async validateTakerTokenAmount(makerTokenAddress: string, takerTokenAddress: string, takerTokenAmount: BigNumber): Promise<boolean> {
        const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(makerTokenAddress, takerTokenAddress);
        return !takerTokenAmount || takerTokenAmount <= new BigNumber(pair.tokenB.maxAmount);
    }
}
