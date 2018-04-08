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
        let pairs: TokenPairTradeInfo[] = await this.tokenPairsService.listPairs(makerTokenAddress, takerTokenAddress);
        pairs = pairs.filter((pair) => pair.tokenA.address === makerTokenAddress && pair.tokenB.address === takerTokenAddress);

        if (!await this.validateOrder(pairs, exchangeContractAddress, makerTokenAddress, takerTokenAddress, taker, takerTokenAmount)) {
            return;
        }
        makerTokenAmount = makerTokenAmount || pairs[0].tokenA.maxAmount;
        takerTokenAmount = takerTokenAmount || pairs[0].tokenB.maxAmount;

        const makerFee = await this.getMakerFee(await this.tokenService.getTokenByAddress(makerTokenAddress), new BigNumber(makerTokenAmount));
        const takerFee = await this.getTakerFee(await this.tokenService.getTokenByAddress(takerTokenAddress), new BigNumber(takerTokenAmount));

        return {
            feeRecipient : await this.getFeeRecipient(),
            makerFee : makerFee.toString(),
            takerFee : takerFee.toString(),
        };
    }

    private async validateOrder(pairs: TokenPairTradeInfo[], exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, taker: string, takerTokenAmount: string): Promise<boolean> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();

        const takerAddress = this.amadeusService.getMainAddress();
        const fieldErrors: string[] = [];
        const errors: FieldErrors = {};

        if (exchangeContractAddress && exchangeContractAddress !== currentContractAddress) {
            const message = `Asked for exchange contract address ${exchangeContractAddress} but currently we support ${currentContractAddress}.`;
            this.parameterError(message, "exchangeContractAddress", errors);
        }
        if (taker && taker !== takerAddress && taker !== Utils.ZERO_ADDRESS) {
            const message = `Asked for taker address ${taker} but currently we support ${takerAddress} or ${Utils.ZERO_ADDRESS}.`;
            this.parameterError(message, "takerAddress", errors);
        }
        if (pairs.length === 0) {
            const message = `Asked for tokens ${makerTokenAddress} and ${takerTokenAddress} but currently we do not support this combination.`;
            this.parameterError(message, "makerTokenAddress|takerTokenAddress", errors);
        } else if (takerTokenAmount && takerTokenAmount > pairs[0].tokenB.maxAmount) {
            const message = `Asked for taker token amount ${takerTokenAmount} but currently we support ${pairs[0].tokenB.maxAmount}.`;
            this.parameterError(message, "takerTokenAmount", errors);
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidateError(errors, "");
        }
        return true;
    }

    private parameterError(message: string, wrongField: string, errors: FieldErrors) {
        this.logger.log(message);
        errors[wrongField] = {
            message: message,
        };
    }
}
