import * as config from "config";
import { inject, injectable } from "inversify";
import { LiquidityService, LoggerService, PaginationService, TickerService, TokenPairsService, TokenService, TYPES } from "../../app";
import { Ticker, Token, TokenPairTradeInfo, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class TokensWithLiquidityTokenPairsService implements TokenPairsService {

    constructor(
        @inject(TYPES.LiquidityService) private liquidityService: LiquidityService,
        @inject(TYPES.TickerService) private tickerService: TickerService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.LoggerService) private loggerService: LoggerService,
        private paginationService: PaginationService,
    ) {
        this.loggerService.setNamespace("tokenswithliquiditytokenpairsservice");
    }

    public async listPairs(tokenA?: string, tokenB?: string, page?: number, perPage?: number): Promise<TokenPairTradeInfo[]> {
        const tradabletokens: Token[] = await this.tokenService.listAllTokens();
        this.loggerService.log("Tradable tokens: %o", tradabletokens);
        let pools: TokenPool[] = await Promise.all(tradabletokens.map(async (token) => await this.liquidityService.getAvailableAmount(token)));
        pools = pools.filter((pool) => pool && !pool.maximumAmount.isNegative() && !pool.maximumAmount.isZero());
        this.loggerService.log("Pools with amount: %o", pools);
        let pairs: TokenPairTradeInfo[] = [];
        if (!tokenA && !tokenB) {
            for (const tokenPool of pools) {
                const foundPairs = await this.getTokenPairsOfToken(tokenPool.token.symbol, pools);
                pairs = pairs.concat(foundPairs);
            }
            this.loggerService.log("Pairs found when tokenA and tokenB not informed: %o", pairs);
        }
        if (tokenA) {
            const tokenAPairs = await this.getTokenPairsOfToken(tokenA, pools);
            this.loggerService.log("Pairs found for tokenA %s: %o", tokenA, tokenAPairs);
            pairs = pairs.concat(tokenAPairs);
        }
        if (tokenB) {
            const tokenBPairs = await this.getTokenPairsOfToken(tokenB, pools);
            this.loggerService.log("Pairs found for tokenB %s: %o", tokenB, tokenBPairs);
            pairs = pairs.concat(tokenBPairs);
        }
        pairs = await this.paginationService.paginate(pairs, page, perPage);
        this.loggerService.log("Pairs are paginated: %o", pairs);
        return pairs;
    }

    private async getTokenPairsOfToken(tokenSymbol: string, pools: TokenPool[]): Promise<TokenPairTradeInfo[]> {
        const tokenPool = pools.find((pool) => pool.token.symbol === tokenSymbol);
        let pairs: TokenPairTradeInfo[] = [];
        if (tokenPool) {
            const testingPools = pools.filter((pool) => pool.token !== tokenPool.token);
            pairs = pairs.concat(await Promise.all(testingPools.map(async (pool) => await this.createTokenPairTradeInfo(tokenPool, pool))));
            for (const pool of testingPools) {
                pairs.push(await this.createTokenPairTradeInfo(pool, tokenPool));
            }
        }
        return pairs;
    }

    private async createTokenPairTradeInfo(tokenPoolFrom: TokenPool, tokenPoolTo: TokenPool): Promise<TokenPairTradeInfo> {
        const ticker = await this.tickerService.getTicker(tokenPoolFrom.token, tokenPoolTo.token);
        if (ticker) {
            return {
                tokenA: {
                    address: tokenPoolFrom.token.address,
                    minAmount: tokenPoolFrom.minimumAmount.toString(),
                    maxAmount: tokenPoolFrom.maximumAmount.toString(),
                    precision: tokenPoolFrom.precision,
                },
                tokenB: {
                    address: tokenPoolTo.token.address,
                    minAmount: tokenPoolTo.minimumAmount.toString(),
                    maxAmount: tokenPoolTo.maximumAmount.toString(),
                    precision: tokenPoolTo.precision,
                },
            };
        }
        return null;
    }
}
