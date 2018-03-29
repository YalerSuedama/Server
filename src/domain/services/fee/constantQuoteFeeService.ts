import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { FieldErrors, ValidateError } from "tsoa";
import { AmadeusService, ExchangeService, FeeService, LoggerService, TickerService, TokenPairsService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token, TokenPairTradeInfo } from "../../../app/models";
import * as Utils from "../../util";

@injectable()
export class ConstantQuoteFeeService implements FeeService {
    constructor( @inject(TYPES.AmadeusService) private amadeusService: AmadeusService, @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService, @inject(TYPES.TokenService) private tokenService: TokenService, @inject(TYPES.TokenPairsService) private tokenPairsService: TokenPairsService,  @inject(TYPES.ExchangeService) private exchangeService: ExchangeService, @inject(TYPES.LoggerService) private logger: LoggerService, private readonly constantFee = config.get<any>("amadeus.fee")) {
    }

    public async getMakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        if (token.symbol === "ZRX") {
            return amount.mul(this.constantFee.taker);
        }

        const zeroExToken = await this.tokenService.getToken("ZRX");

        const ticker: Ticker = await this.tickerService.getTicker(token, zeroExToken);
        if (!ticker) {
            return Utils.toBaseUnit(0);
        }

        return ticker.price.mul(amount).mul(this.constantFee.taker).truncated();
    }

    public async getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return new BigNumber(0);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }

    public async calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();
        const pairs: TokenPairTradeInfo[] = await this.tokenPairsService.listPairs(makerTokenAddress, takerTokenAddress);
        const takerAddress = this.amadeusService.getMainAddress();
        const fieldErrors: string[] = [];

        if (exchangeContractAddress && exchangeContractAddress !== currentContractAddress) {
            this.logger.log("Asked for exchange contract address %s but currently we support %s.", exchangeContractAddress, currentContractAddress);
            fieldErrors.push("exchangeContractAddress");
        }
        if (taker && taker !== takerAddress) {
            this.logger.log("Asked for taker address %s but currently we support %s.", maker, takerAddress);
            fieldErrors.push("taker");
        }
        if (pairs.length === 0) {
            this.logger.log("Asked for tokens %s and %s but currently we do not support this combination.", makerTokenAddress, takerTokenAddress);
            fieldErrors.push("makerTokenAddress");
            fieldErrors.push("takerTokenAddress");
        }
        if (takerTokenAmount && takerTokenAmount > pairs[0].tokenB.maxAmount) {
            this.logger.log("Asked for taker token amount %s but currently we support %s.", takerTokenAmount, pairs[0].tokenB.maxAmount);
            fieldErrors.push("takerTokenAmount");
        }

        if (fieldErrors.length > 0) {
            const errors: FieldErrors = {};

            fieldErrors.forEach((e) => {
                errors[e] = {
                    message: e,
                };
            });

            throw new ValidateError(errors, "");
        }

        const makerFee = await this.getMakerFee(await this.tokenService.getTokenByAddress(makerTokenAddress), new BigNumber(makerTokenAmount));
        const takerFee = await this.getTakerFee(await this.tokenService.getTokenByAddress(takerTokenAddress), new BigNumber(takerTokenAmount));

        return {
            feeRecipient : await this.getFeeRecipient(),
            makerFee : makerFee.toString(),
            takerFee : takerFee.toString(),
        };
    }
}
