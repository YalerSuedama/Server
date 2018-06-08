import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import * as _ from "lodash";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LoggerService, OrderService, PaginationService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../app";
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

        @inject(TYPES.FeeService) @named("ConstantReserveManager")
        private feeService: FeeService,

        @inject(TYPES.SaltService)
        private saltService: SaltService,

        @inject(TYPES.TickerService) @named("Repository")
        private tickerService: TickerService,

        @inject(TYPES.TimeService)
        private timeService: TimeService,

        @inject(TYPES.TokenPairsService)
        private tokenPairsService: TokenPairsService,

        @inject(TYPES.TokenService)
        private tokenService: TokenService,

        @inject(TYPES.LoggerService)
        private logger: LoggerService,

        private paginationService: PaginationService,
    ) {
        this.logger.setNamespace("reservemanagerorderservice");
    }

    public async listOrders(exchangeContractAddress?: string, tokenAddress?: string, makerTokenAddress?: string, takerTokenAddress?: string, maker?: string, taker?: string, trader?: string, feeRecipient?: string, page?: number, perPage?: number): Promise<SignedOrder[]> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();
        const feeRecipientAddress = this.amadeusService.getFeeAddress();
        const makerAddress = this.amadeusService.getMainAddress();
        const takerAddress = taker || trader;
        if (exchangeContractAddress && exchangeContractAddress !== currentContractAddress) {
            this.logger.log("Asked for exchange contract address %s but currently we support %s.", exchangeContractAddress, currentContractAddress);
            return [];
        }
        if (maker && maker !== makerAddress) {
            this.logger.log("Asked for maker address %s but currently we support %s.", maker, makerAddress);
            return [];
        }
        if (feeRecipient && feeRecipient !== feeRecipientAddress) {
            this.logger.log("Asked for fee recipient address %s but currently we support %s.", feeRecipient, feeRecipientAddress);
            return [];
        }

        let pairs: TokenPairTradeInfo[] = await this.tokenPairsService.listPairs();
        if (tokenAddress) {
            pairs = pairs.filter((pair) => pair.tokenA.address === tokenAddress || pair.tokenB.address === tokenAddress);
            this.logger.log("Filtered pairs for tokenAddress %s: %o.", tokenAddress, pairs);
        }
        if (makerTokenAddress) {
            pairs = pairs.filter((pair) => pair.tokenA.address === makerTokenAddress);
            this.logger.log("Filtered pairs for makerTokenAddress %s : %o .", makerTokenAddress, pairs);
        }
        if (takerTokenAddress) {
            pairs = pairs.filter((pair) => pair.tokenB.address === takerTokenAddress);
            this.logger.log("Filtered pairs for takerTokenAddress %s: %o.", takerTokenAddress, pairs);
        }

        let orders = await Promise.all(pairs.map((pair) => this.createSignedOrderFromTokenPair(pair, currentContractAddress, makerAddress, takerAddress, feeRecipientAddress)));

        this.logger.log("Found orders: %o.", orders);
        if (makerTokenAddress && takerTokenAddress) {
            orders = orders.sort((first, second) => {
                // TODO: Fernanda - Need analysis to calculate price considering token decimals
                const firstPrice = new BigNumber(first.takerTokenAmount).dividedBy(first.makerTokenAmount);
                const secondPrice = new BigNumber(second.takerTokenAmount).dividedBy(second.makerTokenAmount);
                return firstPrice.minus(secondPrice).toNumber();
            });
            this.logger.log("Orders are sorted: %o.", orders);
        }

        orders = await this.paginationService.paginate(orders, page, perPage);
        this.logger.log("Orders are paginated: %o.", orders);
        return orders;
    }

    private async createSignedOrderFromTokenPair(pair: TokenPairTradeInfo, exchangeContractAddress: string, maker: string, taker: string, feeRecipient: string): Promise<SignedOrder> {
        this.ensureAllowance(new BigNumber(pair.tokenA.maxAmount), pair.tokenA.address, maker);

        const ticker: Ticker = await this.tickerService.getTicker(await this.tokenService.getTokenByAddress(pair.tokenA.address), await this.tokenService.getTokenByAddress(pair.tokenB.address));
        const takerTokenAmount: BigNumber = Utils.getRoundAmount(new BigNumber(pair.tokenA.maxAmount).mul(ticker.price));

        return await this.cryptographyService.signOrder({
            exchangeContractAddress,
            expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            feeRecipient,
            maker,
            makerFee: (await this.feeService.getMakerFee(ticker.from, new BigNumber(pair.tokenA.maxAmount))).toString(),
            makerTokenAddress: ticker.from.address,
            makerTokenAmount: pair.tokenA.maxAmount,
            salt: await this.saltService.getSalt(),
            taker: taker || Utils.ZERO_ADDRESS,
            takerFee: (await this.feeService.getTakerFee(ticker.to, takerTokenAmount)).toString(),
            takerTokenAddress: ticker.to.address,
            takerTokenAmount: takerTokenAmount.toString(),
        });
    }

    private async createOrder(pair: TokenPairTradeInfo, exchangeContractAddress: string, feeRecipient: string, maker: string, taker: string, tickerService: TickerService, feeService: FeeService) {
        const ticker: Ticker = await tickerService.getTicker(await this.tokenService.getTokenByAddress(pair.tokenA.address), await this.tokenService.getTokenByAddress(pair.tokenB.address));
        const takerTokenAmount: BigNumber = new BigNumber(pair.tokenA.maxAmount).mul(ticker.price).floor();

        return await this.cryptographyService.signOrder({
            exchangeContractAddress,
            expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            feeRecipient,
            maker,
            makerFee: (await feeService.getMakerFee(ticker.from, new BigNumber(pair.tokenA.maxAmount))).toString(),
            makerTokenAddress: ticker.from.address,
            makerTokenAmount: pair.tokenA.maxAmount,
            salt: await this.saltService.getSalt(),
            taker: taker || Utils.ZERO_ADDRESS,
            takerFee: (await feeService.getTakerFee(ticker.to, takerTokenAmount)).toString(),
            takerTokenAddress: ticker.to.address,
            takerTokenAmount: takerTokenAmount.toString(),
        });
    }

    private ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string) {
        this.exchangeService.ensureAllowance(amount, tokenAddress, spenderAddress);
    }
}
