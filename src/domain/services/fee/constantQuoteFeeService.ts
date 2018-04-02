import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { FieldErrors, ValidateError } from "tsoa";
import { AmadeusService, ExchangeService, FeeService, LoggerService, TickerService, TokenPairsService, TokenService, TYPES } from "../../../app";
import { Fee, Ticker, Token, TokenPairTradeInfo } from "../../../app/models";
import * as Utils from "../../util";
import { ConstantFeeService } from "./constantFeeService";

@injectable()
export class ConstantQuoteFeeService extends ConstantFeeService implements FeeService {

    public async getMakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return this.getFee(this.constantFee.maker, token, amount);
    }

    public async getTakerFee(token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return new BigNumber(0);
    }

    public async getFeeRecipient(token?: Token): Promise<string> {
        return this.amadeusService.getFeeAddress();
    }

    public async calculateFee(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, maker: string, taker: string, makerTokenAmount: string, takerTokenAmount: string, expirationUnixTimestampSec: string, salt: string): Promise<Fee> {
        if (!makerTokenAmount || !takerTokenAmount) {
            const pair: TokenPairTradeInfo = await this.tokenPairsService.getPair(makerTokenAddress, takerTokenAddress);
            makerTokenAmount = makerTokenAmount || pair.tokenA.maxAmount;
            takerTokenAmount = takerTokenAmount || pair.tokenB.maxAmount;
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
