import { expect } from "chai";
import * as express from "express";
import { Server } from "http";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import { Controller } from "tsoa";
import { SignedOrder, TokenPairTradeInfo } from "../../src/app/models";
import { OrderController } from "../../src/server/controllers/orderController";
import { TokenPairsController } from "../../src/server/controllers/tokenPairsController";
import { iocContainer } from "../../src/server/middleware/iocContainer";
import { RegisterRoutes } from "../../src/server/middleware/routes/routes";

enum RouteMethods { GET, POST, PUT, DELETE }

class RouteTest<T extends Controller> {
    constructor(public route: string, public routeMethod: RouteMethods, private controllerType: new (...args: any[]) => T, private controllerStub: T, private controllerMethodName: keyof T) { }

    public before(): void {
        iocContainer.rebind(this.controllerType).toConstantValue(this.controllerStub);
    }

    public spyFactory(): sinon.SinonSpy {
        return sinon.spy(iocContainer.get<T>(this.controllerType) as T, this.controllerMethodName);
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

// tslint:disable-next-line:max-classes-per-file
class OrderControllerStub extends OrderController {
    public async listOrders(tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string): Promise<SignedOrder[]> {
        return [];
    }
}
const orderControllerStub: OrderController = new OrderControllerStub(null);

// tslint:disable-next-line:max-classes-per-file
class TokenPairsControllerStub extends TokenPairsController {
    public async listPairs(tokenA?: string, tokenB?: string): Promise<TokenPairTradeInfo[]> {
        return [];
    }
}
const tokenPairsControllerStub: TokenPairsController = new TokenPairsControllerStub(null);

const tests = [
    new RouteTest<OrderController>("/api/v0/orders", RouteMethods.GET, OrderController, orderControllerStub as OrderController, "listOrders"),
    new RouteTest<TokenPairsController>("/api/v0/token_pairs", RouteMethods.GET, TokenPairsController, tokenPairsControllerStub as TokenPairsController, "listPairs"),
];

describe("Routes", () => {
    let expressApp: express.Express;
    let server: Server;

    before((done) => {
        tests.forEach((test) => test.before && test.before());
        expressApp = express();
        RegisterRoutes(expressApp);
        done();
    });

    beforeEach((done) => {
        server = expressApp.listen(3000, done);
    });
    afterEach((done) => {
        server.close(done);
    });

    tests.forEach((test) => {
        describe(test.route, () => {
            let spy: sinon.SinonSpy;

            beforeEach((done) => {
                spy = test.spyFactory();
                done();
            });
            afterEach((done) => {
                spy.restore();
                done();
            });

            it(` ${RouteMethods[test.routeMethod]} should be registered`, (done) => {
                test.callApp(supertest(expressApp), test.route).expect(200, done);
            });
            it(` ${RouteMethods[test.routeMethod]} should call controller`, (done) => {
                test.callApp(supertest(expressApp), test.route).end((err, res) => {
                    // tslint:disable-next-line:no-unused-expression
                    expect(spy).to.be.calledOnce;
                    done(err);
                });
            });
        });
    });
});
