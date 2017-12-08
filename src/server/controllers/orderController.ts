import { inject, injectable } from "inversify";
import * as moment from "moment";
import { Controller, Example, Get, Query, Route } from "tsoa";
import { OrderService, TYPES } from "../../app";
import { SignedOrder } from "../../app/models";

@Route("orders")
@injectable()
export class OrderController extends Controller {

    constructor( @inject(TYPES.OrderService) private orderService: OrderService) {
        super();
    }

    /**
     * Calling this method will return signed orders that can be filled through 0x project's fillOrder to exchange user's takerToken for this relayer's makerToken.
     * This method follows the specifications of the Standard Relayer API v0 as proposed by the 0x Projext team (https://github.com/0xProject/standard-relayer-api).
     * @summary List all orders available through our relayer, given the searched parameters.
     * @param {string} exchangeContractAddress Will return all orders created to this contract address.
     * @param {string} tokenAddress Will return all orders where makerTokenAddress or takerTokenAddress is token address.
     * @param {string} makerTokenAddress Will return all orders where makerTokenAddress is the same address of this parameter.
     * @param {string} takerTokenAddress Will return all orders where takerTokenAddress is the same address of this parameter.
     * @param {string} tokenA Symbol of a token that should be included on orders either as maker or taker. If tokenB is also informed, then this method will return orders with only both tokens, either as maker or taker.
     * @param {string} tokenB Symbol of a token that should be included on orders either as maker or taker. If tokenA is also informed, then this method will return orders with only both tokens, either as maker or taker.
     * @param {string} maker Will return all orders where makerAddress is the same address of this parameter.
     * @param {string} taker Will return all orders where takerAddress is the same address of this parameter.
     * @param {string} trader Will return all orders where makerAddress or takerAddress is the same address of this parameter.
     * @param {string} feeRecipient Will return all orders where feeRecipient is the same address of this parameter.
     * @param {number} page Which page should be returned. If this parameter is not informed, then it will take the default value of 1. Page numbers start at 1.
     * @param {number} per_page Number of orders that should be returned on each page. If this parameter is not informed, then it will take the default value of the total number of orders found.
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
    @Get()
    public async listOrders( @Query() exchangeContractAddress?: string, @Query() tokenAddress?: string, @Query() makerTokenAddress?: string, @Query() takerTokenAddress?: string, @Query() tokenA?: string, @Query() tokenB?: string, @Query() maker?: string, @Query() taker?: string, @Query() trader?: string, @Query() feeRecipient?: string, @Query() page?: number, @Query("per_page") perPage?: number): Promise<SignedOrder[]> {
        return this.orderService.listOrders(exchangeContractAddress, tokenAddress, makerTokenAddress, takerTokenAddress, tokenA, tokenB, maker, taker, trader, feeRecipient, page, perPage);
    }
}
