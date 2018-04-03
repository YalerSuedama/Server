import * as chai from "chai";
import "reflect-metadata";
import { ValidationService } from "../../src/app";
import { ZeroExSchemaBasedValidationService } from "../../src/domain";

const should = chai.should();
const expect = chai.expect;

describe("ValidationService", () => {
    let validationService: ValidationService;
    beforeEach((done) => {
        validationService = new ZeroExSchemaBasedValidationService(null, null, null, null, null, null);
        done();
    });
    it("should return true upon being called with valid addresses", async () => {
        const validAddress = "0xb83eed021c929f4f6817c82a6a1411a7e866a631";
        const response = validationService.isAddress(validAddress);
        // tslint:disable-next-line:no-unused-expression
        expect(response).to.be.true;
    });
    it("should return false upon being called with addresses with invalid length", async () => {
        let invalidAddress = "0xb83eed021c929f4f6817c82a6a1411a7e866a631a78d2";
        let response = validationService.isAddress(invalidAddress);
        // tslint:disable-next-line:no-unused-expression
        expect(response).to.be.false;

        invalidAddress = "0xb83eed021c929f4f6817c82a6a1411a7e";
        response = validationService.isAddress(invalidAddress);
        // tslint:disable-next-line:no-unused-expression
        expect(response).to.be.false;
    });
    it("should return false upon being called with addresses with invalid characters", async () => {
        const invalidAddress = "0xb83eed021c929f4f68yuk82a6a1411a7e866a631";
        const response = validationService.isAddress(invalidAddress);
        // tslint:disable-next-line:no-unused-expression
        expect(response).to.be.false;
    });
    it("should return false upon being called with checksummed addresses", async () => {
        const invalidAddress = "0xb83eEd021c929f4f68ABC82a6a1411a7e866A631";
        const response = validationService.isAddress(invalidAddress);
        // tslint:disable-next-line:no-unused-expression
        expect(response).to.be.false;
    });
});
