import { expect, use } from "chai";
import * as config from "config";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { TimeServiceImpl } from "../../src/domain/services/timeServiceImpl";

use(sinonChai);

describe("TimeServiceImpl", () => {
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
    it("Should return the default expiration time from the config", (done) => {
        const returned = new TimeServiceImpl().getExpirationTimestamp();
        // tslint:disable-next-line:no-unused-expression
        expect(returned).to.be.ok;
        // tslint:disable-next-line:no-unused-expression
        expect(configGetStub).to.be.called;
        done();
    });
});