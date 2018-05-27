import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import { BodyProp, Controller, Example, FieldErrors, Get, Post, Query, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { PriceService, TYPES, ValidationService } from "../../app";
import { Price } from "../../app/models";
import { ParameterException } from "../../domain/exception";
import { ErrorCode, ErrorModel, SimpleErrorModel, ValidationErrorCode, ValidationErrorModel } from "../middleware/errorHandler";
import { ValidationAddressParam } from "../middleware/validator/validationAddressParam";
import { ValidationAddressType } from "../middleware/validator/validationAddressType";

@Route("prices")
@injectable()
export class PriceController extends Controller {

    constructor( @inject(TYPES.PriceService) private priceService: PriceService,
                 @inject(TYPES.ValidationService) private validationService: ValidationService,
               ) {
        super();
    }

    /**
     * @summary Given the tokens addresses of the trade and the trader address, returns the price e the max amounts.
     * @param {string} tokenFrom Will calculate price based on this token address price.
     * @param {string} tokenTo Will calculate price based on this token address price.
     * @param {string} trader Will validate this trader address to calculate price.
     */
    @Example<Price>({
        tokenFrom: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        tokenTo: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        price:  "00000089890000001",
        maxAmountFrom: "000000000000020000",
        maxAmountTo: "000000000000020000",
        minAmountFrom: "000000000000000001",
        minAmountTo: "000000000000000001"
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
    public async calculatePrice(@BodyProp() tokenFrom: string, @BodyProp() tokenTo: string, @BodyProp() trader: string): Promise<Price> {
        await this.validateCalculatePriceRequest(tokenFrom, tokenTo, trader);
        return await this.priceService.calculatePrice(tokenFrom, tokenTo, trader);
    }

    public getAddressParameters(): ValidationAddressParam[] {
        return [
            {param: "trader", type: ValidationAddressType.ANY }
         ];
    }

    private async validateCalculatePriceRequest(tokenFrom: string, tokenTo: string, trader: string) {
        const validationErrors: ValidationErrorModel[] = [];

        if (!await this.validationService.tokenPairIsSupported(tokenTo, tokenFrom)) {
            validationErrors.push({
                code: ValidationErrorCode.UnsupportedOption,
                field: "tokenFrom/tokenTo",
                reason: "Invalid token combination",
            });
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
