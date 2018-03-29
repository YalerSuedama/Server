import { inject, injectable, named } from "inversify";
import { BodyProp, Controller, Example, FieldErrors, Get, Post, Query, Response, Route, SuccessResponse, ValidateError } from "tsoa";
import { FeeService, TYPES } from "../../app";
import { Fee } from "../../app/models";
import { ErrorModel } from "../middleware/errorHandler";

@Route("fees")
@injectable()
export class FeeController extends Controller {

    constructor( @inject(TYPES.FeeService) @named("ConstantQuote") private feeService: FeeService) {
        super();
    }

    /**
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary Given an unsigned order without the fee-related properties, returns the required feeRecipient, makerFee, and takerFee of that order.
     * @param {string} exchangeContractAddress Will return all orders created to this contract address.
     * @param {string} tokenAddress Will return all orders where makerTokenAddress or takerTokenAddress is token address.
     * @param {string} makerTokenAddress Will return all orders where makerTokenAddress is the same address of this parameter.
     * @param {string} takerTokenAddress Will return all orders where takerTokenAddress is the same address of this parameter.
     * @param {string} maker Will return all orders where makerAddress is the same address of this parameter.
     * @param {string} taker Will return all orders where takerAddress is the same address of this parameter.
     * @param {string} makerTokenAmount Will return all orders where takerAddress is the same address of this parameter.
     * @param {string} takerTokenAmount Will return all orders where takerAddress is the same address of this parameter.
     * @param {string} expirationUnixTimestampSec Will return all orders where takerAddress is the same address of this parameter.
     * @param {string} salt Will return all orders where takerAddress is the same address of this parameter.
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
        return await this.feeService.calculateFee(exchangeContractAddress, makerTokenAddress, takerTokenAddress, maker, taker, makerTokenAmount, takerTokenAmount, expirationUnixTimestampSec, salt);
    }
}
