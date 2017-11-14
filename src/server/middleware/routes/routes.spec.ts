import { expect } from "chai";
import * as express from "express";
import { Server } from "http";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import { Controller } from "tsoa";
import { OrderController } from "../../controllers/orderController";
import { TokenPairsController } from "../../controllers/tokenPairsController";
import { iocContainer } from "../../middleware/iocContainer";
import { RegisterRoutes } from "./routes";

enum RouteMethods { GET, POST, PUT, DELETE }

class RouteTest<T extends Controller> {
    constructor(public route: string, public routeMethod: RouteMethods, private controllerType: new (...args: any[]) => T, private controllerMethodName: keyof T) { }

    public before(): void {
        iocContainer.rebind(this.controllerType).to(this.controllerType).inSingletonScope();
    }

    public after(): void {
        iocContainer.rebind(this.controllerType).to(this.controllerType);
    }

    public stubFactory(): sinon.SinonStub {
        return sinon.stub(iocContainer.get<T>(this.controllerType) as T, this.controllerMethodName).returns({});
    }

    public callApp(test: supertest.SuperTest<supertest.Test>, ...args: any[]): supertest.Test {
        switch (this.routeMethod) {
            case RouteMethods.GET:
                return test.get.apply(test, args);
            case RouteMethods.POST:
                return test.post.apply(test, args);
            case RouteMethods.PUT:
                return test.put.apply(test, args);
            case RouteMethods.DELETE:
                return test.delete.apply(test, args);
            default:
                throw new Error(`Invalid route method ${RouteMethods[this.routeMethod]}`);
        }
    }
}

const tests = [
    new RouteTest<OrderController>("/api/v0/orders", RouteMethods.GET, OrderController, "listOrders"),
    new RouteTest<TokenPairsController>("/api/v0/token_pairs", RouteMethods.GET, TokenPairsController, "listPairs"),
];

describe("Routes", () => {
    let expressApp: express.Express;
    let server: Server;

    before(() => {
        tests.forEach((test) => test.before && test.before());
        expressApp = express();
        RegisterRoutes(expressApp);
    });
    after(() => {
        tests.forEach((test) => test.after && test.after());
    });

    beforeEach((done) => {
        server = expressApp.listen(3000, done);
    });
    afterEach((done) => {
        server.close(done);
    });

    tests.forEach((test) => {
        describe(test.route, () => {
            let stub: sinon.SinonStub;

            beforeEach((done) => {
                stub = test.stubFactory();
                done();
            });
            afterEach((done) => {
                stub.restore();
                done();
            });

            it(` ${RouteMethods[test.routeMethod]} should be registered`, (done) => {
                test.callApp(supertest(expressApp), test.route).expect(200, done);
            });
            it(` ${RouteMethods[test.routeMethod]} should call controller`, (done) => {
                test.callApp(supertest(expressApp), test.route).end((err, res) => {
                    // tslint:disable-next-line:no-unused-expression
                    expect(stub).to.be.calledOnce;
                    done(err);
                });
            });
        });
    });
});
