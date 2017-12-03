import { expect, use } from "chai";
import { Container } from "inversify";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { OrderService, TYPES } from "../../src/app";
import { OrderController } from "../../src/server/controllers/orderController";

use(sinonChai);

const orderServiceStub: OrderService = {
    listOrders: (tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string) => Promise.resolve(null),
};

const iocContainer = new Container();
iocContainer.bind<OrderController>(OrderController).toSelf();
iocContainer.bind<OrderService>(TYPES.OrderService).toConstantValue(orderServiceStub);

describe("OrderController", () => {
    describe(".listOrders", () => {
        let spy: sinon.SinonSpy;
        const tokenA = "ZRX";
        const tokenB = "WETH";
        const tokenAddress = "0x0000";

        beforeEach((done) => {
            spy = sinon.spy(iocContainer.get<OrderService>(TYPES.OrderService), "listOrders");
            done();
        });
        afterEach((done) => {
            spy.restore();
            done();
        });

        it("should call orderService.listOrders upon calling its listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders();
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            done();
        });
        it("should pass tokenA as first argument to orderService.listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(tokenA);
            expect(spy).to.be.calledWith(tokenA);
            done();
        });
        it("should pass tokenA as first argument and tokenB as second argument to orderService.listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(tokenA, tokenB);
            expect(spy).to.be.calledWith(tokenA, tokenB);
            done();
        });
        it("should pass makerTokenAddress as parameter to orderService.listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(undefined, undefined, tokenAddress);
            expect(spy.args[0][2]).to.eq(tokenAddress);
            done();
        });
        it("should pass takerTokenAddress as parameter to orderService.listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders(undefined, undefined, undefined, tokenAddress);
            expect(spy.args[0][3]).to.eq(tokenAddress);
            done();
        });
    });
});
