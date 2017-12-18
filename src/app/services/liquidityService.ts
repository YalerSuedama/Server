import { Token, TokenPool } from "../models";

export interface LiquidityService {
    getAvailableAmount(token: Token): Promise<TokenPool>;
}
