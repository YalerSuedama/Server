import * as BigNumber from "bignumber.js";
import { inject, injectable } from "inversify";
import { Controller, Get, Query, Route } from "tsoa";
import { OrderService, TYPES } from "../../app";
import { SignedOrder } from "../../app/models/signedOrder";

@Route("orders")
@injectable()
export class OrderController extends Controller {

    constructor( @inject(TYPES.OrderService) private orderService: OrderService) {
        super();
    }

    @Get()
    public async listOrders( @Query() tokenA?: string, @Query() tokenB?: string): Promise<SignedOrder[]> {
        return this.orderService.listOrders(tokenA, tokenB);
    }
}
