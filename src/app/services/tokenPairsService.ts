import { TokenPairTradeInfo } from "../models";

export interface TokenPairsService {
    listPairs(tokenA?: string, tokenB?: string): Promise<TokenPairTradeInfo[]>;
}
