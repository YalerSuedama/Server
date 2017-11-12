import * as config from "config";
import { inject, injectable } from "inversify";
import { LiquidityService, TickerService, TokenPairsService, TokenService, TYPES } from "../../app";
import { Ticker, Token, TokenPairTradeInfo, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class TokensWithLiquidityTokenPairsService implements TokenPairsService {

    constructor(
        @inject(TYPES.LiquidityService) private liquidityService: LiquidityService,
        @inject(TYPES.TickerService) private tickerService: TickerService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
    ) { }

    public async listPairs(tokenA?: string, tokenB?: string): Promise<TokenPairTradeInfo[]> {
        const tradabletokens: Token[] = await this.tokenService.listAllTokens();
        let pools: TokenPool[] = await Promise.all(tradabletokens.filter((token) => token).map(async (token) => await this.liquidityService.getAvailableAmount(token)));
        pools = pools.filter((pool) => pool && !pool.availableAmount.isNegative() && !pool.availableAmount.isZero());
        let pairs: TokenPairTradeInfo[] = [];
        if (!tokenA && !tokenB) {
            for (const tokenPool of pools) {
                const foundPairs = await this.getTokenPairsOfToken(tokenPool.token.symbol, pools);
                pairs = pairs.concat(foundPairs);
            }
        }
        if (tokenA) {
            pairs = pairs.concat(await this.getTokenPairsOfToken(tokenA, pools));
        }
        if (tokenB) {
            pairs = pairs.concat(await this.getTokenPairsOfToken(tokenB, pools));
        }
        return pairs;
    }

    private async getTokenPairsOfToken(tokenSymbol: string, pools: TokenPool[]): Promise<TokenPairTradeInfo[]> {
        const tokenPool = pools.find((pool) => pool.token.symbol === tokenSymbol);
        if (tokenPool) {
            const testingPools = pools.filter((pool) => pool.token !== tokenPool.token);
            return Promise.all(testingPools.map(async (pool) => await this.createTokenPairTradeInfo(tokenPool, pool)));
        }
        return null;
    }

    private async createTokenPairTradeInfo(tokenPoolFrom: TokenPool, tokenPoolTo: TokenPool): Promise<TokenPairTradeInfo> {
        const ticker = await this.tickerService.getTicker(tokenPoolFrom.token, tokenPoolTo.token);
        const tokenA = ticker.from === tokenPoolFrom.token ? tokenPoolFrom : tokenPoolTo;
        const tokenB = ticker.to === tokenPoolFrom.token ? tokenPoolFrom : tokenPoolTo;
        if (ticker) {
            return {
                tokenA: {
                    address: tokenA.token.address,
                    minAmount: tokenA.minimumAmount.toString(),
                    maxAmount: tokenA.maximumAmount.toString(),
                    precision: tokenA.precision,
                },
                tokenB: {
                    address: tokenB.token.address,
                    minAmount: tokenB.minimumAmount.toString(),
                    maxAmount: tokenB.maximumAmount.toString(),
                    precision: tokenB.precision,
                },
            };
        }
        return null;
    }
}
