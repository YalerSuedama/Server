import { expect, use } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { TokenPairsService, TYPES } from "../../app";
import { TokensWithLiquidityTokenPairsService } from "../../domain";
import { iocContainer } from "../middleware/iocContainer";
import { TokenPairsController } from "./tokenPairsController";

use(sinonChai);

describe("TokenPairsController", () => {
    describe(".listPairs", () => {
        let stub: sinon.SinonStub;
        const tokenA = "ZRX";
        const tokenB = "ETH";

        before(() => {
            iocContainer.rebind(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService).inSingletonScope();
        });
        after(() => {
            iocContainer.rebind(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
        });

        beforeEach(() => {
            stub = sinon.stub(iocContainer.get<TokenPairsService>(TYPES.TokenPairsService), "listPairs").returns([]);
        });
        afterEach(() => {
            stub.restore();
        });

        it("should call tokenPairsService.listPairs upon calling its listPairs", () => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs();
            // tslint:disable-next-line:no-unused-expression
            expect(stub).to.be.calledOnce;
        });
        it("should pass tokenA as first argument to tokenPairsService.listPairs", () => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA);
            expect(stub).to.be.calledWith(tokenA);
        });
        it("should pass tokenA as first argument and tokenB as second argument to tokenPairsService.listPairs", () => {
            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);
            const returned = controller.listPairs(tokenA, tokenB);
            expect(stub).to.be.calledWith(tokenA, tokenB);
        });
    });
});
