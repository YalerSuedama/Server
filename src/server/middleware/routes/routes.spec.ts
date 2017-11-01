import { expect } from "chai";
import * as express from "express";
import { Server } from "http";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import { OrderController } from "../../controllers/orderController";
import { iocContainer } from "../../middleware/iocContainer";
import { RegisterRoutes } from "./routes";

describe("Routes", () => {
    before(() => {
        iocContainer.rebind(OrderController).to(OrderController).inSingletonScope();
    });
    after(() => {
        iocContainer.rebind(OrderController).to(OrderController);
    });

    describe("/api/v0/orders", () => {
        let spy: sinon.SinonSpy;
        let expressApp: express.Express;

        beforeEach((done) => {
            expressApp = express();
            RegisterRoutes(expressApp);
            spy = sinon.spy(iocContainer.get<OrderController>(OrderController), "listOrders");
            done();
        });
        afterEach((done) => {
            spy.restore();
            done();
        });

        it("should be registered", (done) => {
            supertest(expressApp).get("/api/v0/orders").expect(200, done);
        });
        it("should call OrderController.listOrders", (done) => {
            supertest(expressApp).get("/api/v0/orders").end((err, res) => {
                // tslint:disable-next-line:no-unused-expression
                expect(spy).to.be.calledOnce;
                done(err);
            });
        });
    });
});
