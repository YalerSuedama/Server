import { BigNumber } from "bignumber.js";
import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LoggerService, OrderService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../app";
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

        @inject(TYPES.LoggerService)
        private logger: LoggerService,
    ) {
        this.logger.setNamespace("reservemanagerorderservice");
    }

    public async listOrders(exchangeContractAddress?: string, tokenAddress?: string, makerTokenAddress?: string, takerTokenAddress?: string, tokenA?: string, tokenB?: string, maker?: string, taker?: string, trader?: string, feeRecipient?: string): Promise<SignedOrder[]> {
        const currentContractAddress = await this.exchangeService.get0xContractAddress();
        const feeRecipientAddress = this.amadeusService.getFeeAddress();
        const makerAddress = this.amadeusService.getMainAddress();
        if (exchangeContractAddress && exchangeContractAddress !== currentContractAddress) {
            this.logger.log("Asked for exchange contract address %s but currently we support %s.", exchangeContractAddress, currentContractAddress);
            return [];
        }
        if (maker && maker !== makerAddress) {
            this.logger.log("Asked for maker address %s but currently we support %s.", maker, makerAddress);
            return [];
        }
        if (taker && taker !== Utils.ZERO_ADDRESS) {
            this.logger.log("Asked for taker address %s but currently we support %s.", taker, Utils.ZERO_ADDRESS);
            return [];
        }
        if (trader && trader !== makerAddress && trader !== Utils.ZERO_ADDRESS) {
            this.logger.log("Asked for trader address %s but currently we support %s as maker and %s as trader.", trader, makerAddress, Utils.ZERO_ADDRESS);
            return [];
        }
        if (feeRecipient && feeRecipient !== feeRecipientAddress) {
            this.logger.log("Asked for fee recipient address %s but currently we support %s.", feeRecipient, feeRecipientAddress);
            return [];
        }

        let pairs: TokenPairTradeInfo[] = await this.tokenPairsService.listPairs(tokenA, tokenB);
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
        const ordersPromise = Promise.all(pairs.map((pair) => this.createSignedOrderFromTokenPair(pair, currentContractAddress, makerAddress, feeRecipientAddress)));
        if (makerTokenAddress && takerTokenAddress) {
            const orders = await ordersPromise;
            return orders.sort((first, second) => {
                const firstPrice = new BigNumber(first.takerTokenAmount).dividedBy(first.makerTokenAmount);
                const secondPrice = new BigNumber(second.takerTokenAmount).dividedBy(second.makerTokenAmount);
                return firstPrice.minus(secondPrice).toNumber();
            });
        } else {
            return ordersPromise;
        }
    }

    private async createSignedOrderFromTokenPair(pair: TokenPairTradeInfo, exchangeContractAddress: string, maker: string, feeRecipient: string): Promise<SignedOrder> {
        this.ensureAllowance(new BigNumber(pair.tokenA.maxAmount), pair.tokenA.address, maker);
        this.ensureAllowance(new BigNumber(pair.tokenB.maxAmount), pair.tokenB.address, maker);

        const ticker: Ticker = await this.tickerService.getTicker(await this.tokenService.getTokenByAddress(pair.tokenA.address), await this.tokenService.getTokenByAddress(pair.tokenB.address));
        return this.cryptographyService.signOrder({
            exchangeContractAddress,
            expirationUnixTimestampSec: this.timeService.getExpirationTimestamp(),
            feeRecipient,
            maker,
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
