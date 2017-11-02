import { TokenPool } from "../models";

export interface LiquidityService {
    getAvailablePools(...tokens: string[]): Promise<TokenPool[]>;
}
