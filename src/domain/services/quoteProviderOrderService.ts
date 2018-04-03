import { BigNumber } from "bignumber.js";
import { inject, injectable, named } from "inversify";
import * as _ from "lodash";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LoggerService, PaginationService, PostOrderService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../app";
import { SignedOrder, Ticker, TokenPairTradeInfo } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class QuoteProviderOrderService implements PostOrderService {
    constructor(
        @inject(TYPES.AmadeusService)
        private amadeusService: AmadeusService,

        @inject(TYPES.ExchangeService)
        private exchangeService: ExchangeService,

        @inject(TYPES.LoggerService)
        private logger: LoggerService,
    ) {
        this.logger.setNamespace("quoteproviderorderservice");
    }

    public async postOrder(order: SignedOrder) {
        this.logger.log("Filling order %o.", order);
        const takerAddress = this.amadeusService.getMainAddress() || order.taker;
        this.logger.log("Filling order with address %s.", takerAddress);
        await this.ensureAllowance(new BigNumber(order.takerTokenAmount), order.takerTokenAddress, takerAddress);
        this.logger.log("Allowance set for address %s.", takerAddress);
        await this.exchangeService.fillOrder(order, takerAddress);
        this.logger.log("Order %o filled.", order);
    }

    private async ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string): Promise<void> {
        await this.exchangeService.ensureAllowance(amount, tokenAddress, spenderAddress);
    }
}
