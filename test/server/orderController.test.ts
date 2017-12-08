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
        const parameter = "VALUE";

        beforeEach((done) => {
            spy = sinon.spy(iocContainer.get<OrderService>(TYPES.OrderService), "listOrders");
            done();
        });
        afterEach((done) => {
            spy.restore();
            done();
        });

        function callController(parameterValue: string, parameterPosition: number, done: MochaDone): void {
            const controller = iocContainer.get<OrderController>(OrderController);
            const args: any = [];
            for (let index = 0; index < parameterPosition; index++) {
                args.push(undefined);
            }
            args.push(parameterValue);
            const returned = controller.listOrders.apply(controller, args);
            expect(spy.args[0][parameterPosition]).to.eq(parameterValue);
            done();
        }

        it("should call orderService.listOrders upon calling its listOrders", (done) => {
            const controller = iocContainer.get<OrderController>(OrderController);
            const returned = controller.listOrders();
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            done();
        });
        it("should pass exchangeContractAddress as first parameter to orderService.listOrders", (done) => {
            callController(parameter, 0, done);
        });
        it("should pass tokenAddress as second parameter to orderService.listOrders", (done) => {
            callController(parameter, 1, done);
        });
        it("should pass makerTokenAddress as third parameter to orderService.listOrders", (done) => {
            callController(parameter, 2, done);
        });
        it("should pass takerTokenAddress as fourth parameter to orderService.listOrders", (done) => {
            callController(parameter, 3, done);
        });
        it("should pass tokenA as fifth parameter to orderService.listOrders", (done) => {
            callController(parameter, 4, done);
        });
        it("should pass tokenB as sixth argument to orderService.listOrders", (done) => {
            callController(parameter, 5, done);
        });
        it("should pass maker as seventh argument to orderService.listOrders", (done) => {
            callController(parameter, 6, done);
        });
        it("should pass taker as eight argument to orderService.listOrders", (done) => {
            callController(parameter, 7, done);
        });
        it("should pass trader as nineth argument to orderService.listOrders", (done) => {
            callController(parameter, 8, done);
        });
        it("should pass feeRecipient as tenth argument to orderService.listOrders", (done) => {
            callController(parameter, 9, done);
        });
        it("should pass page as eleventh argument to orderService.listOrders", (done) => {
            callController(parameter, 10, done);
        });
        it("should pass per_page as twelveth argument to orderService.listOrders", (done) => {
            callController(parameter, 11, done);
        });
    });
});
