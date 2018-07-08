import { BigNumber } from "bignumber.js";
import { use } from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { Token } from "../../../src/app/models";
import { ConstantQuoteFeeService } from "../../../src/domain/services/fee/constantQuoteFeeService";
import { amadeusServiceStub, createToken, DEFAULT_ADDRESS, exchangeServiceStub, feeServiceStub, liquidityServiceStub, tickerServiceStub, tokenPairsServiceStub, tokenServiceStub } from "../../stubs";
import { expect, should } from "../../util";

use(sinonChai);

class ConstantQuoteFeeServiceTest extends ConstantQuoteFeeService {
}

describe("ConstantQuoteFeeService", () => {
    const ZRXToken = createToken("ZRX");
    const OtherToken = createToken("TK1");
    const OtherToken2 = createToken("TK2");
    const feeValue = 0.001;
    const amount = new BigNumber(10);
    const tokenAMaxAmount = "1000000000000000000";
    const tokenBMaxAmount = "2000000000000000000";
    const tokenAAmount = "500000000000000000";
    const tokenBAmount = "1000000000000000000";
    const maxMakerFee = "000000000000000001";
    const makerFee = "0000000000000000005";
    const tickerValue = 0.5;
    let getPairStub: sinon.SinonStub;
    let getTickerStub: sinon.SinonStub;
    let service: ConstantQuoteFeeServiceTest;
    beforeEach((done) => {
        getPairStub = sinon.stub(tokenPairsServiceStub, "getPair");
        getPairStub.withArgs(OtherToken.address, ZRXToken.address).returns({
            tokenA: {
                address: OtherToken.address,
                maxAmount: tokenBMaxAmount,
                minAmount: "0",
            },
            tokenB: {
                address: ZRXToken.address,
                maxAmount: tokenAMaxAmount,
                minAmount: "0",
            },
        });
        getPairStub.withArgs(OtherToken.address, OtherToken2.address).returns({
            tokenA: {
                address: OtherToken.address,
                maxAmount: tokenBMaxAmount,
                minAmount: "0",
            },
            tokenB: {
                address: OtherToken2.address,
                maxAmount: tokenAMaxAmount,
                minAmount: "0",
            },
        });
        getTickerStub = sinon.stub(tickerServiceStub, "getTicker");
        getTickerStub.withArgs(OtherToken, ZRXToken).returns({
            from: ZRXToken,
            price: new BigNumber(tickerValue),
            to: OtherToken,
        });
        getTickerStub.withArgs(OtherToken2, ZRXToken).returns({
            from: ZRXToken,
            price: new BigNumber(tickerValue),
            to: OtherToken2,
        });
        service = new ConstantQuoteFeeServiceTest(amadeusServiceStub, tickerServiceStub, tokenServiceStub, tokenPairsServiceStub, liquidityServiceStub);
        done();
    });
    afterEach((done) => {
        getPairStub.restore();
        getTickerStub.restore();
        done();
    });
    it("Calculates Taker Fee With Any Token", async () => {
        const fee = await service.getTakerFee(OtherToken, amount);
        // tslint:disable-next-line:no-unused-expression
        expect(fee).to.be.ok;
        expect(fee.toString()).to.be.eq("0");
    });
    context("When maker is ZRX", () => {
        it("Calculates Maker and Taker Fee Without passing amount", async () => {
            const fee = await service.calculateFee(DEFAULT_ADDRESS, ZRXToken.address, OtherToken.address, undefined, undefined, undefined, undefined, undefined, undefined);
            // tslint:disable-next-line:no-unused-expression
            expect(fee).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(getPairStub).to.be.called;
            // tslint:disable-next-line:no-unused-expression
            expect(getTickerStub).not.to.be.called;
            expect(fee.takerFee.toString()).to.be.eq("0");
            expect(fee.makerFee.toString()).to.be.eq(new BigNumber(tokenAMaxAmount).mul(feeValue).toString());
        });
        it("Calculates Maker and Taker Fee passing amount", async () => {
            const fee = await service.calculateFee(DEFAULT_ADDRESS, ZRXToken.address, OtherToken.address, undefined, undefined, tokenAAmount, tokenBAmount, undefined, undefined);
            // tslint:disable-next-line:no-unused-expression
            expect(fee).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(getPairStub).not.to.be.called;
            // tslint:disable-next-line:no-unused-expression
            expect(getTickerStub).not.to.be.called;
            expect(fee.takerFee.toString()).to.be.eq("0");
            expect(fee.makerFee.toString()).to.be.eq(new BigNumber(tokenAAmount).mul(feeValue).toString());
        });
    });
    context("When maker is not ZRX", () => {
        it("Calculates Maker and Taker Fee Without passing amount", async () => {
            const fee = await service.calculateFee(DEFAULT_ADDRESS, OtherToken2.address, OtherToken.address, undefined, undefined, undefined, undefined, undefined, undefined);
            // tslint:disable-next-line:no-unused-expression
            expect(fee).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(getPairStub).to.be.called;
            // tslint:disable-next-line:no-unused-expression
            expect(getTickerStub).to.be.called;
            expect(fee.takerFee.toString()).to.be.eq("0");
            expect(fee.makerFee.toString()).to.be.eq(new BigNumber(tokenAMaxAmount).mul(feeValue).mul(tickerValue).toString());
        });
        it("Calculates Maker and Taker Fee passing amount", async () => {
            const fee = await service.calculateFee(DEFAULT_ADDRESS, OtherToken2.address, OtherToken.address, undefined, undefined, tokenAAmount, tokenBAmount, undefined, undefined);
            // tslint:disable-next-line:no-unused-expression
            expect(fee).to.be.ok;
            // tslint:disable-next-line:no-unused-expression
            expect(getPairStub).not.to.be.called;
            // tslint:disable-next-line:no-unused-expression
            expect(getTickerStub).to.be.called;
            expect(fee.takerFee.toString()).to.be.eq("0");
            expect(fee.makerFee.toString()).to.be.eq(new BigNumber(tokenAAmount).mul(feeValue).mul(tickerValue).toString());
        });
    });
});
