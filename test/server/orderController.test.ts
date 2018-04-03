import { expect, use } from "chai";
import { Container } from "inversify";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { ValidateError } from "tsoa";
import { OrderService, TYPES, ValidationService } from "../../src/app";
import { OrderController } from "../../src/server/controllers/orderController";
import { stubOrderService } from "../stubs";
import { createContainer } from "../stubs/util";

use(sinonChai);

let shouldValidateFalse = false;

const validationServiceStub: ValidationService = {
    isAddress: (address: string) => !shouldValidateFalse,
};

describe("OrderController", () => {
    const iocContainer = createContainer(false, stubOrderService, (c: Container) => {
        c.bind<OrderController>(OrderController).toSelf();
        c.bind<ValidationService>(TYPES.ValidationService).toConstantValue(validationServiceStub);
    });

    describe(".listOrders", () => {
        let spy: sinon.SinonSpy;
        const parameter = "VALUE";

        beforeEach((done) => {
            shouldValidateFalse = false;
            spy = sinon.spy(iocContainer.get<OrderService>(TYPES.OrderService), "listOrders");
            done();
        });
        afterEach((done) => {
            shouldValidateFalse = false;
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
        it("should throw on invalid addresses", async () => {
            shouldValidateFalse = true;
            let returned;
            try {
                returned = await iocContainer.get<OrderController>(OrderController).listOrders("fsjklasdlkjf");
            } catch (error) {
                expect(error).to.be.instanceOf(ValidateError);
                return;
            }
            chai.assert.fail(returned, null, "Expected to have thrown error, but returned.");
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
        it("should pass maker as fifth argument to orderService.listOrders", (done) => {
            callController(parameter, 4, done);
        });
        it("should pass taker as sixth argument to orderService.listOrders", (done) => {
            callController(parameter, 5, done);
        });
        it("should pass trader as seventh argument to orderService.listOrders", (done) => {
            callController(parameter, 6, done);
        });
        it("should pass feeRecipient as eight argument to orderService.listOrders", (done) => {
            callController(parameter, 7, done);
        });
        it("should pass page as nineth argument to orderService.listOrders", (done) => {
            callController(parameter, 8, done);
        });
        it("should pass per_page as tenth argument to orderService.listOrders", (done) => {
            callController(parameter, 9, done);
        });
    });
});
