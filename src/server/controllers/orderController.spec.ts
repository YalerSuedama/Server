import { expect, use } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { OrderService, TYPES } from "../../app";
import { OrderServiceImpl } from "../../domain";
import { iocContainer } from "../middleware/iocContainer";
import { OrderController } from "./orderController";

use(sinonChai);

describe("OrderController", () => {
    describe(".listOrders", () => {
        let stub: sinon.SinonStub;
        const tokenA = "ZRX";
        const tokenB = "ETH";

        before(() => {
            iocContainer.rebind(TYPES.OrderService).to(OrderServiceImpl).inSingletonScope();
        });
        after(() => {
            iocContainer.rebind(TYPES.OrderService).to(OrderServiceImpl);
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
    });
});
