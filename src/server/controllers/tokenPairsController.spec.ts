import { expect, use } from "chai";
import "reflect-metadata";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

use(sinonChai);

describe("TokenPairsController", () => {
    it.skip("maps to '/api/v0/token_pairs' route.");
    describe(".listPairs", () => {
        it.skip("calls GET method of base route.");
        it.skip("expects two parameters: tokenA and tokenB.");
        it.skip("when tokenA informed, returns pairs with tokenA as left-hand side or right-hand side of pair.");
        it.skip("when tokenB informed, returns pairs with tokenB as left-hand side or right-hand side of pair.");
        it.skip("when tokenA and tokenB informed, returns pairs with at least one of the tokens and the other token of the pair is tokenC.");
        it.skip("when tokenA and tokenB informed, returns pairs with tokenA and tokenB as one pair (in either side of the pair).");
    });
});
