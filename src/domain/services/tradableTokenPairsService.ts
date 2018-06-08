import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable, named } from "inversify";
import { LoggerService, PaginationService, TickerService, TokenPairsService, TokenService, TYPES } from "../../app";
import { Ticker, Token, TokenPairTradeInfo, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class TradableTokenPairsService implements TokenPairsService {
    constructor(
        @inject(TYPES.TickerService) @named("Repository") private tickerService: TickerService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.LoggerService) private loggerService: LoggerService,
        private paginationService: PaginationService,
    ) {
        this.loggerService.setNamespace("tradabletokenpairsservice");
    }

    public async listPairs(tokenA?: string, tokenB?: string, page?: number, perPage?: number): Promise<TokenPairTradeInfo[]> {
        const tradabletokens: Token[] = await this.tokenService.listAllTokens();
        this.loggerService.log("Tradable tokens: %o", tradabletokens);
        let pairs: TokenPairTradeInfo[] = await this.getAllPairs(tradabletokens);
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

    private async getAllPairs(tradabletokens: Token[]): Promise<TokenPairTradeInfo[]> {
        const pairs: TokenPairTradeInfo[] = [];
        for (const tokenFrom of tradabletokens) {
            for (const tokenTo of tradabletokens) {
                if (tokenFrom.address !== tokenTo.address && pairs.find((p) => (p.tokenA.address === tokenFrom.address && p.tokenB.address === tokenTo.address) || (p.tokenB.address === tokenFrom.address && p.tokenA.address === tokenTo.address)) == null) {
                    const pair = await this.createTokenPairTradeInfo(tokenFrom, tokenTo);
                    if (pair) {
                        pairs.push(pair);
                    }
                }
            }
        }
        return pairs;
    }

    private async createTokenPairTradeInfo(tokenFrom: Token, tokenTo: Token): Promise<TokenPairTradeInfo> {
        return {
            tokenA: {
                address: tokenFrom.address,
                maxAmount: "9999999",
                minAmount: "00000",
                precision: 8,
            },
            tokenB: {
                address: tokenTo.address,
                maxAmount:  "9999999",
                minAmount:  "00000",
                precision: 8,
            },
        };
    }
}
