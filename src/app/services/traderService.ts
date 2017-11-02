import { TokenPool, Trader } from "../models";

export interface TraderService {
    createMaker(pool: TokenPool): Trader;
    createTaker(pool: TokenPool): Trader;
}
