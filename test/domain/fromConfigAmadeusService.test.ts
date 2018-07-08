import { BigNumber } from "bignumber.js";
import { expect, use } from "chai";
import * as config from "config";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { FromConfigAmadeusService } from "../../src/domain/services/fromConfigAmadeusService";

use(sinonChai);

describe("FromConfigAmadeusService", () => {
    const defaultConfigValue = "1";
    let configGetStub: sinon.SinonStub;
    let configHasStub: sinon.SinonStub;
    beforeEach((done) => {
        configGetStub = sinon.stub(config, "get").returns(defaultConfigValue);
        configHasStub = sinon.stub(config, "has").returns(true);
        done();
    });
    afterEach((done) => {
        configGetStub.restore();
        configHasStub.restore();
        done();
    });
    it("Gets the precision from the config file.", (done) => {
        const returned = new FromConfigAmadeusService().getPrecision();
        expect(returned).to.be.ok.and.to.be.eq(defaultConfigValue);
        // tslint:disable-next-line:no-unused-expression
        expect(configGetStub).to.be.called;
        done();
    });
    it("Gets the fee address from the config file.", (done) => {
        const returned = new FromConfigAmadeusService().getFeeAddress();
        expect(returned).to.be.ok.and.to.be.eq(defaultConfigValue);
        // tslint:disable-next-line:no-unused-expression
        expect(configGetStub).to.be.called;
        done();
    });
    it("Gets the main address from the config file.", (done) => {
        const returned = new FromConfigAmadeusService().getMainAddress();
        expect(returned).to.be.ok.and.to.be.eq(defaultConfigValue);
        // tslint:disable-next-line:no-unused-expression
        expect(configGetStub).to.be.called;
        done();
    });
    it("Gets the minimum amount from the config file.", (done) => {
        const returned = new FromConfigAmadeusService().getMinimumAmount();
        expect(returned).to.be.ok.and.to.be.instanceof(BigNumber);
        expect(returned.toString()).to.be.eq(new BigNumber(defaultConfigValue).toString());
        // tslint:disable-next-line:no-unused-expression
        expect(configGetStub).to.be.called;
        done();
    });
});
