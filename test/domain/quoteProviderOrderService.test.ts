import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { LoggerDebug } from "../../src/domain/services/loggerDebug";
import { QuoteProviderOrderService } from "../../src/domain/services/quoteProviderOrderService";
import { amadeusServiceStub, exchangeServiceStub } from "../stubs";
import { expect, should } from "../util";

chai.use(sinonChai);

const STUB_ORDER = {
    ecSignature: {
        v: 1,
        r: "1",
        s: "1",
    },
    maker: "1",
    taker: "1",
    makerFee: "1",
    takerFee: "1",
    makerTokenAmount: "1",
    takerTokenAmount: "1",
    makerTokenAddress: "1",
    takerTokenAddress: "1",
    salt: "1",
    exchangeContractAddress: "1",
    feeRecipient: "1",
    expirationUnixTimestampSec: "1",
};

describe("QuoteProviderOrderService", () => {
    let service: QuoteProviderOrderService;
    let ensureAllowanceSpy: sinon.SinonSpy;
    let fillOrderSpy: sinon.SinonSpy;
    beforeEach((done) => {
        ensureAllowanceSpy = sinon.spy(exchangeServiceStub, "ensureAllowance");
        fillOrderSpy = sinon.spy(exchangeServiceStub, "fillOrder");
        service = new QuoteProviderOrderService(amadeusServiceStub, exchangeServiceStub, new LoggerDebug());
        done();
    });
    afterEach((done) => {
        ensureAllowanceSpy.restore();
        fillOrderSpy.restore();
        done();
    });
    it("Throws when a null order is informed", async () => {
        try {
            await service.postOrder(null);
            chai.assert.fail("Expected to throw, but returned.");
        } catch (error) {
            expect(error).to.be.instanceOf(Error).and.that.has.property("message", "Order must be informed.");
        }
    });
    it("Calls ensureAllowance when receiving order", async () => {
        await service.postOrder(STUB_ORDER);
        // tslint:disable-next-line:no-unused-expression
        expect(ensureAllowanceSpy).to.be.calledOnce;
    });
    it("Calss fillOrder when receiving an order", async () => {
        await service.postOrder(STUB_ORDER);
        // tslint:disable-next-line:no-unused-expression
        expect(fillOrderSpy).to.be.calledOnce;
    });
});
