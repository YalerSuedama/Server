import { expect, use } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { OrderService, TYPES } from "../../src/app";
import { ReserveManagerOrderService } from "../../src/domain";
import { OrderController } from "../../src/server/controllers/orderController";
import { iocContainer } from "../../src/server/middleware/iocContainer";

use(sinonChai);

describe("OrderController", () => {
    describe(".listOrders", () => {
        let stub: sinon.SinonStub;
        const tokenA = "ZRX";
        const tokenB = "WETH";
        const tokenAddress = "0x0000";

        before(() => {
            iocContainer.rebind(TYPES.OrderService).to(ReserveManagerOrderService).inSingletonScope();
        });
        after(() => {
            iocContainer.rebind(TYPES.OrderService).to(ReserveManagerOrderService);
        });

        beforeEach(() => {
            stub = sinon.stub(iocContainer.get<OrderService>(TYPES.OrderService), "listOrders").returns(null);
        });
        afterEach(() => {
            stub.restore();
        });

        it("should call orderService.listOrders upon calling its listOrders", () => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders();
            // tslint:disable-next-line:no-unused-expression
            expect(stub).to.be.calledOnce;
        });
        it("should pass tokenA as first argument to orderService.listOrders", () => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(tokenA);
            expect(stub).to.be.calledWith(tokenA);
        });
        it("should pass tokenA as first argument and tokenB as second argument to orderService.listOrders", () => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(tokenA, tokenB);
            expect(stub).to.be.calledWith(tokenA, tokenB);
        });
        it("should pass makerTokenAddress as parameter to orderService.listOrders", () => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(undefined, undefined, tokenAddress);
            expect(stub.args[0][2]).to.eq(tokenAddress);
        });
        it("should pass takerTokenAddress as parameter to orderService.listOrders", () => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(undefined, undefined, undefined, tokenAddress);
            expect(stub.args[0][3]).to.eq(tokenAddress);
        });
    });
});
