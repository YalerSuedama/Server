import { injectable } from "inversify";
import { TraderService } from "../../app";
import { TokenPool, Trader } from "../../app/models";

@injectable()
export class ReserveManagerTraderService implements TraderService {
    public async createMaker(pool: TokenPool): Promise<Trader> {
        return {
            traderAddress: "0x0000000000000000000000000000000000000000",
            traderTokenAddress: pool.tokenFrom.addres,
            tokenAmount: pool.tokenFromPoolAmount,
        };
    }
    public async createTaker(pool: TokenPool): Promise<Trader> {
        return {
            traderAddress: "0x0000000000000000000000000000000000000000",
            traderTokenAddress: pool.tokenTo.addres,
            tokenAmount: pool.tokenToPoolAmount,
        };
    }
}
