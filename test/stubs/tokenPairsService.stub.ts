import { TokenPairsService, TYPES } from "../../src/app/index";
import { TokenPairTradeInfo } from "../../src/app/models/index";
import { Container } from "inversify";
import { createToken, TOKENS } from "./util";

const stub: TokenPairsService = {
    listPairs: (tokenA?: string, tokenB?: string) => {
        const tokens = TOKENS.map((token) => createToken(token));
        let pairs: TokenPairTradeInfo[] = [];
        for (const token of tokens) {
            for (const tokenTo of tokens) {
                if (tokenTo !== token) {
                    pairs.push({
                        tokenA: {
                            address: token.address,
                            minAmount: "0",
                            maxAmount: "1",
                            precision: 1,
                        },
                        tokenB: {
                            address: tokenTo.address,
                            minAmount: "0",
                            maxAmount: "1",
                            precision: 1,
                        },
                    });
                }
            }
        }
        if (tokenA) {
            const token = tokens.find((t) => t.symbol === tokenA);
            pairs = pairs.filter((pair) => pair.tokenA.address === token.address || pair.tokenB.address === token.address);
        }
        if (tokenB) {
            const token = tokens.find((t) => t.symbol === tokenB);
            pairs = pairs.filter((pair) => pair.tokenA.address === token.address || pair.tokenB.address === token.address);
        }
        return Promise.resolve(pairs);
    },
};

export function stubTokenPairsService(iocContainer: Container) {
    iocContainer.bind<TokenPairsService>(TYPES.TokenPairsService).toConstantValue(stub);
}
