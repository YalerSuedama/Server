import { BigNumber } from "bignumber.js";
import { inject, injectable } from "inversify";
import * as moment from "moment";
import { BodyProp, Controller, Example, FieldErrors, Post, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { CryptographyService, PostOrderService, TYPES, ValidationService } from "../../app";
import { ECSignature, SignedOrder } from "../../app/models";
import { ParameterException } from "../../domain/exception";
import { ErrorCode, ErrorModel, SimpleErrorModel, ValidationErrorCode, ValidationErrorModel } from "../middleware/errorHandler";
import { ValidationAddressParam } from "../middleware/validator/validationAddressParam";
import { ValidationAddressType } from "../middleware/validator/validationAddressType";

@Route("order")
@injectable()
export class PostOrderController extends Controller {

    constructor(
        @inject(TYPES.PostOrderService) private postOrderService: PostOrderService,
        @inject(TYPES.CryptographyService) private cryptographyService: CryptographyService,
        @inject(TYPES.ValidationService) private validationService: ValidationService,
    ) {
        super();
    }

    /**
     * This method allows signed orders to be submited to our relayer so they can be filled by Amadeus Relayer.
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary Submit a signed order to our relayer.
     * @param {ECSignature} ecSignature The order signature, signed with the maker private key.
     * @param {string} exchangeContractAddress The exchange contract address.
     * @param {string} taker The wallet address of who will fill ypur order or a zero address.
     * @param {string} maker Your wallet address.
     * @param {string} expirationUnixTimestampSec The order expiration time in seconds.
     * @isInt expirationUnixTimestampSec
     * @param {string} feeRecipient The address of fee recipient (e.g.: relayer address).
     * @param {string} makerFee The fee amount you will pay, in ZRX.
     * @isInt makerFee
     * @param {string} makerTokenAddress The token addres you desire to sell.
     * @param {string} makerTokenAmount The amount you desire to sell.
     * @isInt makerTokenAmount
     * @param {string} salt A unique number (a random number).
     * @isInt salt
     * @param {string} takerFee The fee amount the taker will pay, in ZRX.
     * @isInt takerFee
     * @param {string} takerTokenAddress The token addres you desire to buy.
     * @param {string} takerTokenAmount The amount you desire to buy.
     * @isInt takerTokenAmount
     */
    @Example<SignedOrder>({
        ecSignature: {
            r: "string",
            s: "string",
            v: 0,
        },
        exchangeContractAddress: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        expirationUnixTimestampSec: "1511833100",
        feeRecipient: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        maker: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        makerFee: "000000000000000001",
        makerTokenAddress: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        makerTokenAmount: "1000000000000000000",
        salt: "72190258645710948815942036721950834632004444658131970136856055217425783080581",
        taker: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        takerFee: "000000000000000001",
        takerTokenAddress: "0x23d4fe8c00ae3b267ea349eed18ed32b71c93f4d",
        takerTokenAmount: "1000000000000000000",
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
    @SuccessResponse("201", "Order submitted and filled")
    @Post()
    public async postOrder(@BodyProp() ecSignature: ECSignature, @BodyProp() maker: string, @BodyProp() taker: string, @BodyProp() makerFee: string, @BodyProp() takerFee: string,
                           @BodyProp() makerTokenAmount: string, @BodyProp() takerTokenAmount: string, @BodyProp() makerTokenAddress: string, @BodyProp() takerTokenAddress: string, @BodyProp() salt: string,
                           @BodyProp() exchangeContractAddress: string, @BodyProp() feeRecipient: string, @BodyProp() expirationUnixTimestampSec: string): Promise<void> {
        const signedOrder = {
            ecSignature: ecSignature,
            exchangeContractAddress: exchangeContractAddress,
            expirationUnixTimestampSec: expirationUnixTimestampSec,
            feeRecipient: feeRecipient,
            maker: maker,
            makerFee: makerFee,
            makerTokenAddress: makerTokenAddress,
            makerTokenAmount: makerTokenAmount,
            salt: salt,
            taker: taker,
            takerFee: takerFee,
            takerTokenAddress: takerTokenAddress,
            takerTokenAmount: takerTokenAmount,
        };
        await this.validateSignedOrder(signedOrder);
        return await this.postOrderService.postOrder(signedOrder);
    }

    public getStatus(): number {
        return 201;
    }

    public getAddressParameters(): ValidationAddressParam[] {
        return [
            {param: "exchangeContractAddress", type: ValidationAddressType.EXCHANGE_CONTRACT },
            {param: "makerTokenAddress", type: ValidationAddressType.ANY },
            {param: "takerTokenAddress", type: ValidationAddressType.ANY },
            {param: "maker", type: ValidationAddressType.ANY },
            {param: "taker", type: ValidationAddressType.RELAYER_OR_ZERO },
            {param: "feeRecipient", type: ValidationAddressType.RELAYER },
        ];
    }

    private async validateSignedOrder(signedOrder: SignedOrder): Promise<void> {
        const validationErrors: ValidationErrorModel[] = [];

        if (! await this.cryptographyService.isValidSignedOrder(signedOrder)) {
            validationErrors.push({
                code: ValidationErrorCode.InvalidECDSAOrHash,
                field: "ecSignature",
                reason: "Signed order not valid",
            });
        }

        if (!await this.validationService.tokenPairIsSupported(signedOrder.takerTokenAddress, signedOrder.makerTokenAddress)) {
            validationErrors.push({
                code: ValidationErrorCode.UnsupportedOption,
                field: "makerTokenAddress/takerTokenAddress",
                reason: "Invalid token combination",
            });
        } else {
            if (!await this.validationService.validateTokenSoldAmount(signedOrder.makerTokenAddress, signedOrder.takerTokenAddress, new BigNumber(signedOrder.makerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "makerTokenAmount",
                    reason: "Invalid maker token amount",
                });
            }
            if (!await this.validationService.validateTokenBoughtAmount(signedOrder.takerTokenAddress, signedOrder.makerTokenAddress, new BigNumber(signedOrder.takerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "takerTokenAmount",
                    reason: "Invalid taker token amount",
                });
            }
            if (! await this.validationService.validatePrice(signedOrder.makerTokenAddress, signedOrder.takerTokenAddress, new BigNumber(signedOrder.makerTokenAmount), new BigNumber(signedOrder.takerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "makerTokenAmount",
                    reason: "Price not valid",
                });
            }
            if (! await this.validationService.validateFee(signedOrder.makerTokenAddress, new BigNumber(signedOrder.makerFee), new BigNumber(signedOrder.makerTokenAmount))) {
                validationErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: "makerFee",
                    reason: "Fee not valid",
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
