import { schemas, SchemaValidator, ValidatorResult } from "@0xproject/json-schemas";
import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { AmadeusService, ExchangeService, FeeService, TickerService, TokenPairsService, TokenService, TYPES, ValidationService } from "../../app";
import { TokenPairTradeInfo } from "../../app/models";
import { ZERO_ADDRESS } from "../util";

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
        return address === ZERO_ADDRESS || address === this.amadeusService.getMainAddress();
    }

    public async validateFee(makerTokenAddress: string, makerFee: BigNumber, makerTokenAmount: BigNumber): Promise<boolean> {
        const token = await this.tokenService.getTokenByAddress(makerTokenAddress);
        const amadeusFee = await this.feeService.getMakerFee(token, makerTokenAmount);
        return amadeusFee.lessThanOrEqualTo(makerFee);
    }
    public async validatePrice(makerTokenAddress: string, takerTokenAddress: string, makerTokenAmount: BigNumber, takerTokenAmount: BigNumber): Promise<boolean> {
        const makerToken = await this.tokenService.getTokenByAddress(makerTokenAddress);
        const takerToken = await this.tokenService.getTokenByAddress(takerTokenAddress);
        const ticker = await this.tickerService.getTicker(makerToken, takerToken);
        const orderPrice = takerTokenAmount.dividedBy(makerTokenAmount);
        const valid = ticker.price.sub(orderPrice).abs().lessThanOrEqualTo(ticker.price.times(0.01));
        return valid;
    }

    public async validateCurrentContractAddress(address: string): Promise<boolean> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();
        return !address || address === currentContractAddress;
    }

    public async tokenPairIsSupported(tokenBoughtAddress: string, tokenSoldAddress: string): Promise<boolean> {
        const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(tokenBoughtAddress, tokenSoldAddress);
        return pair !== undefined;
    }

    public async validateTokenBoughtAmount(tokenBoughtAddress: string, tokenSoldAddress: string, tokenBoughtAmount: BigNumber): Promise<boolean> {
        const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(tokenBoughtAddress, tokenSoldAddress);
        return !tokenBoughtAmount || (tokenBoughtAmount.lessThanOrEqualTo(new BigNumber(pair.tokenA.maxAmount)) && tokenBoughtAmount.greaterThanOrEqualTo(new BigNumber(pair.tokenA.minAmount)));
    }

    public async validateTokenSoldAmount(tokenSoldAddress: string, tokenBoughtAddress: string, tokenSoldAmount: BigNumber): Promise<boolean> {
        const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(tokenBoughtAddress, tokenSoldAddress);
        return !tokenSoldAmount || (tokenSoldAmount.lessThanOrEqualTo(new BigNumber(pair.tokenB.maxAmount)) && tokenSoldAmount.greaterThanOrEqualTo(new BigNumber(pair.tokenB.minAmount)));
    }
}
