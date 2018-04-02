import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { BodyProp, Controller, Example, FieldErrors, Get, Post, Query, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { FeeService, TYPES, ValidationService } from "../../app";
import { Fee } from "../../app/models";
import { ErrorModel } from "../middleware/errorHandler";

@Route("fees")
@injectable()
export class FeeController extends Controller {

    constructor( @inject(TYPES.FeeService) @named("ConstantQuote") private feeService: FeeService,
                 @inject(TYPES.ValidationService) private validationService: ValidationService,
               ) {
        super();
    }

    /**
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary Given an unsigned order without the fee-related properties, returns the required feeRecipient, makerFee, and takerFee of that order.
     * @param {string} exchangeContractAddress Will validate this contract address to calculate fee.
     * @param {string} makerTokenAddress Will calculate maker fee based on this maker token address price.
     * @param {string} takerTokenAddress Will calculate taker fee based on this taker token address price.
     * @param {string} maker Will validate this maker address to calculate fee.
     * @param {string} taker Will validate this taker address to calculate fee, and it has to be the relayer address.
     * @param {string} makerTokenAmount Will calculate convertion price based on this maker token amount, and will use it to calculate fee.
     * @param {string} takerTokenAmount Will calculate convertion price based on this taker token amount, and will use it to calculate fee.
     * @param {string} expirationUnixTimestampSec Will validate the expiration time to calculate fee.
     * @param {string} salt Will validate this unique number to calculate fee.
     */
    @Example<Fee>({
        feeRecipient: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        makerFee: "000000000000000001",
        takerFee: "000000000000000001",
    })
    @Response<ErrorModel>("400", "A parameter is not informed correctly.", {
        message: "some string",
    })
    @Response<ErrorModel>("500", "An unknown error occurred.", {
        message: "some string",
    })
    @Post()
    public async calculateFee(@BodyProp() exchangeContractAddress: string, @BodyProp() makerTokenAddress: string, @BodyProp() takerTokenAddress: string, @BodyProp() maker: string, @BodyProp() taker: string, @BodyProp() makerTokenAmount: string, @BodyProp() takerTokenAmount: string, @BodyProp() expirationUnixTimestampSec: string, @BodyProp() salt: string): Promise<Fee> {
        await this.validateUnsignedOrder(exchangeContractAddress, makerTokenAddress, takerTokenAddress, taker, takerTokenAmount);
        return await this.feeService.calculateFee(exchangeContractAddress, makerTokenAddress, takerTokenAddress, maker, taker, makerTokenAmount, takerTokenAmount, expirationUnixTimestampSec, salt);
    }

    private async validateUnsignedOrder(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, taker: string, takerTokenAmount: string) {
        const errors: FieldErrors = {};

        if (!await this.validationService.validateCurrentContractAddress(exchangeContractAddress)) {
            errors.exchangeContractAddress = {
                message: "Invalid exchange contract address",
            };
        }
        if (!this.validationService.validateMainAddress(taker)) {
            errors.takerAddress = {
                message: "Invalid taker address",
            };
        }
        if (!await this.validationService.tokenPairIsSupported(makerTokenAddress, takerTokenAddress)) {
            errors.makerTokenAddress_takerTokenAddress = {
                message: "Invalid token combination",
            };
        } else if (!await this.validationService.validateTakerTokenAmount(makerTokenAddress, takerTokenAddress, new BigNumber(takerTokenAmount))) {
            errors.takerTokenAmount = {
                message: "Invalid taker token amount",
            };
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidateError(errors, "");
        }
    }
}
