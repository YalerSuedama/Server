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
        let stub: sinon.SinonSpy;
        let expressApp: express.Express;
        let server: Server;

        beforeEach(() => {
            expressApp = express();
            expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || 500);
                res.json({
                    message: err.message,
                    error: err,
                });
            });
            RegisterRoutes(expressApp);
            server = expressApp.listen(3000);
            stub = sinon.spy(iocContainer.get<OrderController>(OrderController), "listOrders");
        });
        afterEach((done) => {
            stub.restore();
            server.close(done);
        });

        it("should be registered", () => {
            supertest(server).get("/api/v0/orders").expect(200);
        });
        it.skip("should call OrderController.listOrders", () => {
            supertest(server).get("api/v0/orders");
            // tslint:disable-next-line:no-unused-expression
            expect(stub).to.be.calledOnce;
        });
    });
});
