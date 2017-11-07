import { BigNumber } from "bignumber.js";
import { inject, injectable } from "inversify";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, OrderService, SaltService, TickerService, TimeService, TokenService, TYPES } from "../../app";
import { SignedOrder, Ticker, TokenPool } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ReserveManagerOrderService implements OrderService {
    constructor(
        @inject(TYPES.AmadeusService)
        private amadeusService: AmadeusService,

        @inject(TYPES.CryptographyService)
        private cryptographyService: CryptographyService,

        @inject(TYPES.ExchangeService)
        private exchangeService: ExchangeService,

        @inject(TYPES.FeeService)
        private feeService: FeeService,

        @inject(TYPES.LiquidityService)
        private liquidityService: LiquidityService,

        @inject(TYPES.SaltService)
        private saltService: SaltService,

        @inject(TYPES.TickerService)
        private tickerService: TickerService,

        @inject(TYPES.TimeService)
        private timeService: TimeService,

        @inject(TYPES.TokenService)
        private tokenService: TokenService,
    ) {
    }

    public async listOrders(tokenA?: string, tokenB?: string): Promise<SignedOrder[]> {
        const tokens = (await this.tokenService.listAllTokens()).filter((token) => token);
        let tokensFrom;
        if (!tokenA && !tokenB) {
            tokensFrom = tokens;
        } else {
            tokensFrom = tokens.filter((token) => token.symbol === tokenA || token.symbol === tokenB);
        }
        const pools = await Promise.all(tokensFrom.map((token) => this.liquidityService.getAvailableAmount(token)));
        tokensFrom = tokensFrom.filter((token) => !pools.find((pool) => pool.token === token).availableAmount.isZero());
        const tickers: Ticker[] = Utils.flatten(await Promise.all(tokensFrom.map((from) => Promise.all(tokens.filter((token) => token !== from).map((to) => this.tickerService.getTicker(from, to))))));
        return Promise.all(tickers.filter((ticker) => ticker).map(async (ticker) => this.cryptographyService.signOrder({
            exchangeContractAddress: await this.exchangeService.get0xContractAddress(),
            expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            feeRecipient: await this.feeService.getFeeRecipient(),
            maker: await this.amadeusService.getMainAddress(),
            makerFee: (await this.feeService.getMakerFee(ticker.from)).toString(),
            makerTokenAddress: ticker.from.address,
            makerTokenAmount: pools.find((pool) => pool.token === ticker.from).availableAmount.toString(),
            salt: await this.saltService.getSalt(),
            taker: Utils.ZERO_ADDRESS,
            takerFee: (await this.feeService.getTakerFee(ticker.to)).toString(),
            takerTokenAddress: ticker.to.address,
            takerTokenAmount: pools.find((pool) => pool.token === ticker.from).availableAmount.dividedToIntegerBy(ticker.ask).toString(),
        })));
    }
}
