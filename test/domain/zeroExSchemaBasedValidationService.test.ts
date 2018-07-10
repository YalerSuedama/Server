import { BigNumber } from "bignumber.js";
import * as chai from "chai";
import { Container, interfaces } from "inversify";
import "reflect-metadata";
import { TYPES, ValidationService } from "../../src/app";
import { ZeroExSchemaBasedValidationService } from "../../src/domain";
import { amadeusServiceStubFactory, exchangeServiceStubFactory, feeServiceStubFactory, liquidityServiceStubFactory, tickerServiceStubFactory, tokenPairsServiceStubFactory, tokenServiceStubFactory, whitelistStubFactory } from "../stubs";
import { BLOCKED_ADDRESS, createContainer, createToken, DEFAULT_ADDRESS, TOKENS, ZERO_ADDRESS } from "../stubs/util";

const should = chai.should();
const expect = chai.expect;

describe("ZeroExSchemaBasedValidationService", () => {
    const iocContainer = createContainer(true, exchangeServiceStubFactory, feeServiceStubFactory, liquidityServiceStubFactory, tickerServiceStubFactory, tokenPairsServiceStubFactory, tokenServiceStubFactory, amadeusServiceStubFactory, whitelistStubFactory, (c: Container) => {
        c.bind<ValidationService>(TYPES.ValidationService).to(ZeroExSchemaBasedValidationService);
    });


    describe("isAddress", () => {
        it("should return true upon being called with valid addresses", async () => {
            const validAddress = "0xb83eed021c929f4f6817c82a6a1411a7e866a631";
            const response = iocContainer.get<ValidationService>(TYPES.ValidationService).isAddress(validAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return false upon being called with addresses with invalid length", async () => {
            let invalidAddress = "0xb83eed021c929f4f6817c82a6a1411a7e866a631a78d2";
            let response = iocContainer.get<ValidationService>(TYPES.ValidationService).isAddress(invalidAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;

            invalidAddress = "0xb83eed021c929f4f6817c82a6a1411a7e";
            response = iocContainer.get<ValidationService>(TYPES.ValidationService).isAddress(invalidAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return false upon being called with addresses with invalid characters", async () => {
            const invalidAddress = "0xb83eed021c929f4f68yuk82a6a1411a7e866a631";
            const response = iocContainer.get<ValidationService>(TYPES.ValidationService).isAddress(invalidAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return false upon being called with checksummed addresses", async () => {
            const invalidAddress = "0xb83eEd021c929f4f68ABC82a6a1411a7e866A631";
            const response = iocContainer.get<ValidationService>(TYPES.ValidationService).isAddress(invalidAddress);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
    });
    describe("tokenPairIsSupported", () => {
        it("should return false upon being called with invalid pair", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).tokenPairIsSupported(addressBought, addressSold + "A");
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with valid pair", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).tokenPairIsSupported(addressBought, addressSold);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
    describe("validateCurrentContractAddress", () => {
        it("should return false upon being called with wrong address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateCurrentContractAddress(DEFAULT_ADDRESS + "A");
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with correct address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateCurrentContractAddress(DEFAULT_ADDRESS + "ZRX");
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
    describe("isWhitelistedAddress", () => {
        it("should return false upon being called with not whitelisted address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).isWhitelistedAddress(BLOCKED_ADDRESS);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with whitelisted address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).isWhitelistedAddress(DEFAULT_ADDRESS);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
    describe("validateMainAddress", () => {
        it("should return false upon being called with invalid address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateMainAddress(DEFAULT_ADDRESS + "AAA", true);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with main address", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateMainAddress(DEFAULT_ADDRESS + "MAI", true);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return true upon being called with zero address and allows zero", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateMainAddress(ZERO_ADDRESS, true);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return false upon being called with zero address and not allows zero", async () => {
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateMainAddress(ZERO_ADDRESS, false);
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
    });
    describe("validateFee", () => {
        it("should return true upon being called with exact fee", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateFee(addressBought, new BigNumber(100000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return true upon being called with greather fee", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateFee(addressBought, new BigNumber(110000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return false upon being called with lesser fee", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateFee(addressBought, new BigNumber(90000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
    });
    describe("validateTokenBoughtAmount", () => {
        it("should return false upon being called with greather than max", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenBoughtAmount(addressBought, addressSold, new BigNumber(150000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return false upon being called with lesser than min", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenBoughtAmount(addressBought, addressSold, new BigNumber(2000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with in range amount", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenBoughtAmount(addressBought, addressSold, new BigNumber(20000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
    describe("validateTokenSoldAmount", () => {
        it("should return false upon being called with greather than max", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenSoldAmount(addressBought, addressSold, new BigNumber(300000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return false upon being called with lesser than min", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenSoldAmount(addressBought, addressSold, new BigNumber(10000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with in range amount", async () => {
            const symbolBought = TOKENS[0];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[1];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validateTokenSoldAmount(addressBought, addressSold, new BigNumber(150000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
    describe("validatePrice", () => {
        it("should return true upon being called with lesser price", async () => {
            const symbolBought = TOKENS[1];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[2];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validatePrice(addressBought, addressSold, new BigNumber(150000000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
        it("should return false upon being called with greather price", async () => {
            const symbolBought = TOKENS[1];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[2];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validatePrice(addressBought, addressSold, new BigNumber(300000000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.false;
        });
        it("should return true upon being called with correct price", async () => {
            const symbolBought = TOKENS[1];
            const addressBought = DEFAULT_ADDRESS + symbolBought;
            const symbolSold = TOKENS[2];
            const addressSold = DEFAULT_ADDRESS + symbolSold;
            const response = await iocContainer.get<ValidationService>(TYPES.ValidationService).validatePrice(addressBought, addressSold, new BigNumber(200000000000000), new BigNumber(100000000000000));
            // tslint:disable-next-line:no-unused-expression
            expect(response).to.be.true;
        });
    });
});
