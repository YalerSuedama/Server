import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { BodyProp, Controller, Example, FieldErrors, Get, Post, Query, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { FeeService, TYPES, ValidationService } from "../../app";
import { Fee } from "../../app/models";
import { ParameterException } from "../../domain/exception";
import { ErrorCode, ErrorModel, SimpleErrorModel, ValidationErrorCode, ValidationErrorModel } from "../middleware/errorHandler";
import { ValidationAddressParam } from "../middleware/validator/validationAddressParam";
import { ValidationAddressType } from "../middleware/validator/validationAddressType";

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
     * @isInt makerTokenAmount
     * @param {string} takerTokenAmount Will calculate convertion price based on this taker token amount, and will use it to calculate fee.
     * @isInt takerTokenAmount
     * @param {string} expirationUnixTimestampSec Will validate the expiration time to calculate fee.
     * @isInt expirationUnixTimestampSec
     * @param {string} salt Will validate this unique number to calculate fee.
     * @isInt salt
     */
    @Example<Fee>({
        feeRecipient: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        makerFee: "000000000000000001",
        takerFee: "000000000000000001",
    })
    @Response<ErrorModel>("400", "A parameter is not informed correctly.", {
        code: ErrorCode.ValidationFailed,
        reason: "some string",
        validationErrors: [{
            code: ValidationErrorCode.RequiredField,
            field: "field name",
            reason: "some string",
        }],
    })
    @Response<SimpleErrorModel>("500", "An unknown error occurred.", {
        code: ErrorCode.UnknownError,
        reason: "some string",
    })
    @Post()
    public async calculateFee(@BodyProp() exchangeContractAddress: string, @BodyProp() makerTokenAddress: string, @BodyProp() takerTokenAddress: string,
                              @BodyProp() maker: string, @BodyProp() taker: string, @BodyProp() expirationUnixTimestampSec: string,
                              @BodyProp() salt: string, @BodyProp() makerTokenAmount?: string,
                              @BodyProp() takerTokenAmount?: string): Promise<Fee> {

        await this.validateUnsignedOrder(exchangeContractAddress, makerTokenAddress, takerTokenAddress, taker, makerTokenAmount, takerTokenAmount);
        return await this.feeService.calculateFee(exchangeContractAddress, makerTokenAddress, takerTokenAddress, maker, taker, makerTokenAmount + "", takerTokenAmount, expirationUnixTimestampSec, salt);
    }

    public getAddressParameters(): ValidationAddressParam[] {
        return [
            {param: "exchangeContractAddress", type: ValidationAddressType.EXCHANGE_CONTRACT },
            {param: "makerTokenAddress", type: ValidationAddressType.ANY },
            {param: "takerTokenAddress", type: ValidationAddressType.ANY },
            {param: "maker", type: ValidationAddressType.ANY },
            {param: "taker", type: ValidationAddressType.RELAYER_OR_ZERO },
         ];
    }

    private async validateUnsignedOrder(exchangeContractAddress: string, makerTokenAddress: string, takerTokenAddress: string, taker: string, makerTokenAmount?: string, takerTokenAmount?: string) {
        const validationErrors: ValidationErrorModel[] = [];

        if (!await this.validationService.tokenPairIsSupported(takerTokenAddress, makerTokenAddress)) {
            validationErrors.push({
                code: ValidationErrorCode.UnsupportedOption,
                field: "makerTokenAddress/takerTokenAddress",
                reason: "Invalid token combination",
            });
        } else {
            if (makerTokenAmount && !await this.validationService.validateTokenSoldAmount(makerTokenAddress, takerTokenAddress, new BigNumber(makerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "makerTokenAmount",
                    reason: "Invalid maker token amount",
                });
            }
            if (takerTokenAmount && !await this.validationService.validateTokenBoughtAmount(takerTokenAddress, makerTokenAddress, new BigNumber(takerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "takerTokenAmount",
                    reason: "Invalid taker token amount",
                });
            }
       }

        if (validationErrors.length > 0) {
            const exception = new ParameterException();
            exception.code = ErrorCode.ValidationFailed;
            exception.message = "Invalid parameters";
            exception.name = "Invalid parameters";
            exception.validationErrors = validationErrors;
            throw exception;
        }
    }
}
