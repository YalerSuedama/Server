import { Container } from "inversify";
import { TokenService, TYPES } from "../../src/app";
import { createToken, TOKENS } from "./util";

const tokenServiceStub: TokenService = {
    getToken: (symbol: string) => Promise.resolve(createToken(symbol)),
    getTokenByAddress: (address: string) => Promise.resolve(TOKENS.map((symbol) => createToken(symbol)).find((token) => token.address === address)),
    listAllTokens: () => Promise.resolve(TOKENS.map((symbol) => createToken(symbol))),
};

export function tokenServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<TokenService>(TYPES.TokenService).toConstantValue(tokenServiceStub);
}
