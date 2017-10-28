import * as BigNumber from "bignumber.js";
import { Controller, Get, Query, Route } from "tsoa";
import { SignedOrderResponse } from "../models/signedOrderResponse";

@Route("orders")
export class OrderController extends Controller {

    @Get()
    public getOrders( @Query() tokenA?: string, @Query() tokenB?: string): SignedOrderResponse[] {
        return [
            {
                maker: "",
                taker: "",
                makerFee: "",
                takerFee: "",
                makerTokenAmount: "",
                takerTokenAmount: "",
                makerTokenAddress: "",
                takerTokenAddress: "",
                salt: "",
                exchangeContractAddress: "",
                feeRecipient: "",
                expirationUnixTimestampSec: "",
                ecSignature: {
                    r: "", s: "", v: 0,
                },
            },
        ];
    }
}
