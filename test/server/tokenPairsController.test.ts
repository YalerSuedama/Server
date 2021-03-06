import { expect, use } from "chai";
import { Container } from "inversify";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { TokenPairsService, TYPES } from "../../src/app";
import { TokenPairsController } from "../../src/server/controllers/tokenPairsController";

use(sinonChai);

const tokenPairsServiceStub: TokenPairsService = {
    getPair: (tokenA: string, tokenB: string) => Promise.resolve(null),
    listPairs: (tokenA?: string, tokenB?: string) => Promise.resolve(null),
};

const iocContainer = new Container();
iocContainer.bind<TokenPairsController>(TokenPairsController).toSelf();
iocContainer.bind<TokenPairsService>(TYPES.TokenPairsService).toConstantValue(tokenPairsServiceStub);

describe("TokenPairsController", () => {
    describe(".listPairs", () => {
        let spy: sinon.SinonSpy;
        const tokenA = "ZRX";
        const tokenB = "WETH";

        beforeEach((done) => {
            spy = sinon.spy(iocContainer.get<TokenPairsService>(TYPES.TokenPairsService), "listPairs");
            done();
        });
        afterEach((done) => {
            spy.restore();
            done();
        });

        it("should call tokenPairsService.listPairs upon calling its listPairs", (done) => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs();
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            done();
        });
        it("should pass tokenA as first argument to tokenPairsService.listPairs", (done) => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA);
            expect(spy).to.be.calledWith(tokenA);
            done();
        });
        it("should pass tokenA as first argument and tokenB as second argument to tokenPairsService.listPairs", (done) => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA, tokenB);
            expect(spy).to.be.calledWith(tokenA, tokenB);
            done();
        });
        it("should pass page as third argument to tokenPairsService.listPairs", (done) => {
            const parameterValue = 1;
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA, tokenB, parameterValue);
            expect(spy.args[0][2]).to.eq(parameterValue);
            done();
        });
        it("should pass perPage as fourth argument to tokenPairsService.listPairs", (done) => {
            const parameterValue = 10;
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA, tokenB, undefined, parameterValue);
            expect(spy.args[0][3]).to.eq(parameterValue);
            done();
        });
    });
});
