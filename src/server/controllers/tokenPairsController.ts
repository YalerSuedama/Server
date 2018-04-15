import { inject, injectable } from "inversify";
import { Controller, Example, FieldErrors, Get, Query, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { TokenPairsService, TYPES, ValidationService } from "../../app";
import { TokenPairTradeInfo } from "../../app/models";
import { ParameterValidator } from "../../server/controllers/parameterValidator";
import { ErrorCode, ErrorModel, ValidationErrorCode } from "../middleware/errorHandler";

@Route("token_pairs")
@injectable()
export class TokenPairsController extends Controller {

    constructor(
        @inject(TYPES.TokenPairsService) private tokenPairsService: TokenPairsService,
        @inject(TYPES.ValidationService) private validationService: ValidationService) {
        super();
    }

    /**
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary Lists all available trading pairs that this relayer current supports.
     * @param {string} tokenA Address of a token that could be on either side of the trade: either as a maker, or as a taker.
     * @param {string} tokenB Address of a token that could be on either side of the trade: either as a maker, or as a taker.
     * @param {number} page Which page should be returned. If this parameter is not informed, then it will take the default value of 1. Page numbers start at 1.
     * @param {number} perPage Number of token pairs that should be returned on each page. If this parameter is not informed, then it will take the default value of the total number of token pairs found.
     */
    @Example<TokenPairTradeInfo>({
        tokenA: {
            address: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
            maxAmount: "1000000000000000000",
            minAmount: "000000000000000001",
            precision: 6,
        },
        tokenB: {
            address: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
            maxAmount: "1000000000000000000",
            minAmount: "000000000000000001",
            precision: 6,
        },
    })
    @Response<ErrorModel>("400", "A parameter is not informed correctly.", {
        code: ErrorCode.ValidationFailed,
        reason: "some string",
        validationErrors: [{
            code: ValidationErrorCode.RequiredField​​,
            field: "field name",
            reason: "some string",
        }],
    })
    @Response<ErrorModel>("500", "An unknown error occurred.", {
        code: ErrorCode.UnknownError,
        reason: "some string",
        validationErrors: null,
    })
    @Get()
    public async listPairs( @Query() tokenA?: string, @Query() tokenB?: string, @Query() page?: number, @Query("per_page") perPage?: number): Promise<TokenPairTradeInfo[]> {
        const validator = new ParameterValidator(this.validationService);
        validator.addPageParameters(page, perPage);
        validator.validate();
        return await this.tokenPairsService.listPairs(tokenA, tokenB, page, perPage);
    }

    public getAddressParameters(): string[] {
        return ["tokenA", "tokenB"];
    }
}
