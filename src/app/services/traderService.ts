import { TokenPool, Trader } from "../models";

export interface TraderService {
    createMaker(pool: TokenPool): Promise<Trader>;
    createTaker(pool: TokenPool): Promise<Trader>;
}
