import { Token } from "../models";

export interface TokenService {
    getToken(symbol: string): Promise<Token>;
    getTokenByAddress(address: string): Promise<Token>;
    listAllTokens(): Promise<Token[]>;
}
