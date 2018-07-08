import { BigNumber } from "bignumber.js";
import { use } from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { Token } from "../../../src/app/models";
import { BaseFeeService } from "../../../src/domain/services/fee/baseFeeService";
import { amadeusServiceStub, createToken, exchangeServiceStub, liquidityServiceStub, tickerServiceStub, tokenPairsServiceStub, tokenServiceStub } from "../../stubs";
import { expect, should } from "../../util";

use(sinonChai);

class FeeService extends BaseFeeService {
    public testFeeService(feeValue: number, token?: Token, amount?: BigNumber): Promise<BigNumber> {
        return this.getFee(feeValue, token, amount);
    }
}

describe("BaseFeeService", () => {
    const ZRXToken = createToken("ZRX");
    const OtherToken = createToken("TK1");
    const feeValue = 10;
    const amount = new BigNumber(10);
    const tickerValue = 0.5;
    let getTickerStub: sinon.SinonStub;
    let service: FeeService;
    beforeEach((done) => {
        getTickerStub = sinon.stub(tickerServiceStub, "getTicker");
        getTickerStub.withArgs(OtherToken, ZRXToken).returns({
            from: OtherToken,
            price: new BigNumber(tickerValue),
            to: ZRXToken,
        });
        service = new FeeService(amadeusServiceStub, tickerServiceStub, tokenServiceStub, tokenPairsServiceStub, liquidityServiceStub);
        done();
    });
    afterEach((done) => {
        getTickerStub.restore();
        done();
    });
    it("Calculates ZRX tokens multiplying the amount.", async () => {
        const fee = await service.testFeeService(feeValue, ZRXToken, amount);
        // tslint:disable-next-line:no-unused-expression
        expect(fee).to.be.ok;
        expect(fee.toString()).to.be.eq(amount.mul(feeValue).toString());
    });
    it("Calculates tokens other than ZRX fetching the current ticker of the token.", async () => {
        const fee = await service.testFeeService(feeValue, OtherToken, amount);
        // tslint:disable-next-line:no-unused-expression
        expect(fee).to.be.ok;
        // tslint:disable-next-line:no-unused-expression
        expect(getTickerStub).to.be.called;
        expect(fee.toString()).to.be.eq(amount.mul(feeValue).mul(tickerValue).toString());
    });
    context("No ticker", () => {
        beforeEach((done) => {
            getTickerStub.withArgs(OtherToken, ZRXToken).returns(null);
            done();
        });
        it("Returns zero if the token has no ticker.", async () => {
            const fee = await service.testFeeService(feeValue, OtherToken, amount);
            // tslint:disable-next-line:no-unused-expression
            expect(fee).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(getTickerStub).to.be.called;
            expect(fee.toString()).to.be.eq(new BigNumber(0).toString());
        });
    });
    it("Returns the floor value when it is a decimal number whose first decimal place is up to .5.", async () => {
        const fee = await service.testFeeService(0.26, OtherToken, amount);
        // tslint:disable-next-line:no-unused-expression
        expect(fee).to.be.ok;
        // tslint:disable-next-line:no-unused-expression
        expect(getTickerStub).to.be.called;
        expect(fee.toString()).to.be.eq(new BigNumber(1).toString());
    });
    it("Returns the floor value when it is a decimal number whose first decimal place is greater then .5.", async () => {
        const fee = await service.testFeeService(0.34, OtherToken, amount);
        // tslint:disable-next-line:no-unused-expression
        expect(fee).to.be.ok;
        // tslint:disable-next-line:no-unused-expression
        expect(getTickerStub).to.be.called;
        expect(fee.toString()).to.be.eq(new BigNumber(1).toString());
    });
});
