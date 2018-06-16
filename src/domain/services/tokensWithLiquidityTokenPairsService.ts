import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { LiquidityService, LoggerService, PaginationService, TickerService, TokenPairsService, TokenService, TYPES } from "../../app";
import { Ticker, Token, TokenPairTradeInfo, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class TokensWithLiquidityTokenPairsService implements TokenPairsService {

    private static readonly BASE_VALUE = new BigNumber(10).pow(12);

    constructor(
        @inject(TYPES.LiquidityService) private liquidityService: LiquidityService,
        @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService,
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
        let pairs: TokenPairTradeInfo[] = await this.getAllPairs(pools, tradabletokens);
        if (tokenA && tokenB) {
            pairs = pairs.filter((pair) => pair.tokenA.address === tokenA || pair.tokenB.address === tokenA || pair.tokenA.address === tokenB || pair.tokenB.address === tokenB);
        } else if (tokenA) {
            pairs = pairs.filter((pair) => pair.tokenA.address === tokenA || pair.tokenB.address === tokenA);
        } else if (tokenB) {
            pairs = pairs.filter((pair) => pair.tokenA.address === tokenB || pair.tokenB.address === tokenB);
        }
        pairs = await this.paginationService.paginate(pairs, page, perPage);
        this.loggerService.log("Pairs are paginated: %o", pairs);
        return pairs;
    }

    public async getPair(tokenBought: string, tokenSold: string): Promise<TokenPairTradeInfo> {
        let pairs: TokenPairTradeInfo[] = await this.listPairs(tokenBought, tokenSold);
        pairs = pairs.filter((pair) => pair.tokenA.address === tokenBought && pair.tokenB.address === tokenSold);

        return pairs && pairs[0];
    }

    private async getAllPairs(pools: TokenPool[], tradabletokens: Token[]): Promise<TokenPairTradeInfo[]> {
        const pairs: TokenPairTradeInfo[] = [];
        for (const pool of pools) {
            for (const token of tradabletokens) {
                if (token.address !== pool.token.address) {
                    const pair = await this.createTokenPairTradeInfo(pool, token);
                    if (pair) {
                        pairs.push(pair);
                    }
                }
            }
        }
        return pairs;
    }

    private async createTokenPairTradeInfo(tokenPoolFrom: TokenPool, tokenTo: Token): Promise<TokenPairTradeInfo> {
        const ticker = await this.tickerService.getTicker(tokenPoolFrom.token, tokenTo);
        if (ticker) {
            if (ticker.price.greaterThan(1)) {
                const tokenBMaximumAmount = this.liquidityService.getConvertedAmount(tokenPoolFrom.maximumAmount, ticker.price, tokenPoolFrom.token, tokenTo);
                const tokenBMinimumAmount = this.liquidityService.getConvertedAmount(tokenPoolFrom.minimumAmount, ticker.price, tokenPoolFrom.token, tokenTo);
                return {
                    tokenA: {
                        address: tokenPoolFrom.token.address,
                        maxAmount: tokenPoolFrom.maximumAmount.toString(),
                        minAmount: tokenPoolFrom.minimumAmount.toString(),
                        precision: tokenPoolFrom.precision,
                    },
                    tokenB: {
                        address: tokenTo.address,
                        maxAmount: Utils.getRoundAmount(tokenBMaximumAmount, tokenTo.decimals).toString(),
                        minAmount: Utils.getRoundAmount(tokenBMinimumAmount, tokenTo.decimals).toString(),
                        precision: tokenPoolFrom.precision,
                    },
                };
            }
            // TODO: Fernanda - How to change this?
            if (Utils.getRoundAmount(tokenPoolFrom.minimumAmount.dividedBy(ticker.price), tokenPoolFrom.token.decimals).lessThan(tokenPoolFrom.maximumAmount)) {
                return {
                    tokenA: {
                        address: tokenPoolFrom.token.address,
                        maxAmount: tokenPoolFrom.maximumAmount.toString(),
                        minAmount: Utils.getRoundAmount(tokenPoolFrom.minimumAmount.dividedBy(ticker.price), tokenPoolFrom.token.decimals).toString(),
                        precision: tokenPoolFrom.precision,
                    },
                    tokenB: {
                        address: tokenTo.address,
                        maxAmount: Utils.getRoundAmount(tokenPoolFrom.maximumAmount.mul(ticker.price), tokenTo.decimals).toString(),
                        minAmount: tokenPoolFrom.minimumAmount.toString(),
                        precision: tokenPoolFrom.precision,
                    },
                };
            }
        }
        return null;
    }

}
