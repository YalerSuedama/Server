import { inject, injectable } from "inversify";
import { CryptographyService, ExchangeService, FeeService, LiquidityService, OrderService, SaltService, TimeService, TraderService, TYPES } from "../../app";
import { SignedOrder, TokenPool, Trader } from "../../app/models";

@injectable()
export class OrderServiceImpl implements OrderService {
    constructor(
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

        @inject(TYPES.TraderService)
        private traderService: TraderService,

        @inject(TYPES.TimeService)
        private timeService: TimeService,
    ) {
    }

    public async listOrders(tokenA?: string, tokenB?: string): Promise<SignedOrder[]> {
        const orders: SignedOrder[] = [];
        const pools: TokenPool[] = await this.liquidityService.getAvailablePools(tokenA, tokenB);
        return Promise.all(pools.map(async (pool) => {
            const makerTrader: Trader = await this.traderService.createMaker(pool);
            const takerTrader: Trader = await this.traderService.createTaker(pool);
            return await this.cryptographyService.signOrder({
                maker: makerTrader.traderAddress,
                makerTokenAmount: makerTrader.tokenAmount.toString(),
                makerTokenAddress: makerTrader.traderTokenAddress,
                taker: takerTrader.traderAddress,
                takerTokenAmount: takerTrader.tokenAmount.toString(),
                takerTokenAddress: takerTrader.traderTokenAddress,
                makerFee: (await this.feeService.getMakerFee(tokenA)).toString(),
                takerFee: (await this.feeService.getTakerFee(tokenA)).toString(),
                salt: await this.saltService.getSalt(),
                exchangeContractAddress: await this.exchangeService.getContractAddress(),
                feeRecipient: await this.feeService.getFeeRecipient(),
                expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            });
        }));
    }
}
