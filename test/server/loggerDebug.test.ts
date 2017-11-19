import { expect } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import { LoggerDebug } from "../../src/server/middleware/common/loggerDebug";

const namespace: string = "TestLogger";
const message: string = "Message";

describe("Logger", () => {
    let sinonStub: sinon.SinonStub;
    beforeEach(() => {
        process.env.DEBUG = "Test";
        sinonStub = sinon.stub(process.stderr, "write");
    });
    afterEach(() => {
        sinonStub.restore();
    });
    it("should write to stderr", () => {
        const logger = new LoggerDebug();
        logger.setNamespace(namespace);
        logger.log(message);
        expect(sinonStub.getCall(0).args[0]).to.include(message, "Did not write correct message");
    });
});
