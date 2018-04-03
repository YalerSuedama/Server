import { TokenPairTradeInfo } from "../models";

export interface TokenPairsService {
    listPairs(tokenA?: string, tokenB?: string, page?: number, perPage?: number): Promise<TokenPairTradeInfo[]>;
}
