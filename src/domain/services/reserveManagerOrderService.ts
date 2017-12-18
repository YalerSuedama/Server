import { BigNumber } from "bignumber.js";
import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, OrderService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../app";
import { SignedOrder, Ticker, TokenPairTradeInfo } from "../../app/models";
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

        @inject(TYPES.SaltService)
        private saltService: SaltService,

        @inject(TYPES.TickerService)
        private tickerService: TickerService,

        @inject(TYPES.TimeService)
        private timeService: TimeService,

        @inject(TYPES.TokenPairsService)
        private tokenPairsService: TokenPairsService,

        @inject(TYPES.TokenService)
        private tokenService: TokenService,
    ) {
    }

    public async listOrders(tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string): Promise<SignedOrder[]> {
        let pairs: TokenPairTradeInfo[] = await this.tokenPairsService.listPairs(tokenA, tokenB);
        if (makerTokenAddress) {
            pairs = pairs.filter((pair) => pair.tokenA.address === makerTokenAddress);
        }
        if (takerTokenAddress) {
            pairs = pairs.filter((pair) => pair.tokenB.address === takerTokenAddress);
        }
        return Promise.all(pairs.map((pair) => this.createSignedOrderFromTokenPair(pair)));
    }

    private async createSignedOrderFromTokenPair(pair: TokenPairTradeInfo): Promise<SignedOrder> {
        const makerAddress = await this.amadeusService.getMainAddress();
        this.ensureAllowance(new BigNumber(pair.tokenA.maxAmount), pair.tokenA.address, makerAddress);
        this.ensureAllowance(new BigNumber(pair.tokenB.maxAmount), pair.tokenB.address, makerAddress);

        const ticker: Ticker = await this.tickerService.getTicker(await this.tokenService.getTokenByAddress(pair.tokenA.address), await this.tokenService.getTokenByAddress(pair.tokenB.address));
        return this.cryptographyService.signOrder({
            exchangeContractAddress: await this.exchangeService.get0xContractAddress(),
            expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            feeRecipient: await this.feeService.getFeeRecipient(),
            maker: makerAddress,
            makerFee: (await this.feeService.getMakerFee(ticker.from)).toString(),
            makerTokenAddress: ticker.from.address,
            makerTokenAmount: pair.tokenA.maxAmount.toString(),
            salt: await this.saltService.getSalt(),
            taker: Utils.ZERO_ADDRESS,
            takerFee: (await this.feeService.getTakerFee(ticker.to)).toString(),
            takerTokenAddress: ticker.to.address,
            takerTokenAmount: new BigNumber(pair.tokenA.maxAmount).mul(ticker.ask).floor().toString(),
        });
    }

    private ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string) {
        this.exchangeService.ensureAllowance(amount, tokenAddress, spenderAddress);
    }
}
