import { expect } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import { LoggerDebug } from "../../src/domain/services/loggerDebug";

const namespace: string = "TestLogger";
const message: string = "Message";

describe("LoggerDebug", () => {
    let sinonStub: sinon.SinonStub;

    beforeEach(() => {
        sinonStub = sinon.stub(process.stderr, "write");
    });
    afterEach(() => {
        sinonStub.restore();
    });

    it("should write to stderr", () => {
        const logger = new LoggerDebug();
        logger.setNamespace(namespace);
        logger.log(message);
        expect(sinonStub).to.be.calledOnce.and.calledWithMatch(message);
    });
});
