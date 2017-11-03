import * as BigNumber from "bignumber.js";
import { injectable } from "inversify";
import { LiquidityService } from "../../app";
import { TokenPool } from "../../app/models";

@injectable()
export class AccountPercentageLiquidityService implements LiquidityService {
    public async getAvailablePools(...tokens: string[]): Promise<TokenPool[]> {
        return Promise.all(tokens.map(async (token) => {
            return {
                tokenFrom: {
                    addres: "0x0000000000000000000000000000000000000000",
                    symbol: token,
                    decimals: 1000000000000000000,
                },
                tokenFromPoolAmount: new BigNumber(100000000000000000000),
                tokenTo: {
                    addres: "0x0000000000000000000000000000000000000000",
                    symbol: "ETH",
                    decimals: 1000000000000000000,
                },
                tokenToPoolAmount: new BigNumber(1000000000000000000),
            };
        }));
    }
}
