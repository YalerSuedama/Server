import { inject, injectable } from "inversify";
import * as moment from "moment";
import { Body, Controller, Example, FieldErrors, Post, Response, Route, ValidateError } from "tsoa";
import { CryptographyService, PostOrderService, TYPES } from "../../app";
import { SignedOrder } from "../../app/models";
import { ErrorModel } from "../middleware/errorHandler";

@Route("order")
@injectable()
export class PostOrderController extends Controller {

    constructor(
        @inject(TYPES.PostOrderService) private postOrderService: PostOrderService,
        @inject(TYPES.CryptographyService) private cryptographyService: CryptographyService,
    ) {
        super();
    }

    /**
     * This method allows signed orders to be submited to our relayer so they can be filled by Amadeus Relayer.
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary Submit a signed order to our relayer.
     * @param {SignedOrder} signed order.
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
        message: "some string",
    })
    @Response<ErrorModel>("500", "An unknown error occurred.", {
        message: "some string",
    })
    @Post()
    public async postOrder(@Body() signedOrder?: SignedOrder ): Promise<void> {
        this.validateSignedOrder(signedOrder);
        return await this.postOrderService.postOrder(signedOrder);
    }

    private validateSignedOrder(signedOrder: SignedOrder): void {
        const fieldErrors: FieldErrors = {};

        if (signedOrder == null) {
            fieldErrors.null = {
                message: "Signed order not provided",
            };
        }

        if (!this.cryptographyService.isValidSignedOrder(signedOrder)) {
            fieldErrors.signature = {
                message: "Signed order not valid",
            };
        }

        if (!this.postOrderService.validateFee(signedOrder)) {
            fieldErrors.fee = {
                message: "Fee not valid",
            };
        }

        if (!this.postOrderService.validatePrice(signedOrder)) {
            fieldErrors.price = {
                message: "Fee not valid",
            };
        }

        if (!this.postOrderService.validateTakerAddress(signedOrder)) {
            fieldErrors.takerAddress = {
                message: "Fee not valid",
            };
        }

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, "");
        }
    }
}
