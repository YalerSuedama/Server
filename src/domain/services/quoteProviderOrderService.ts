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

        @inject(TYPES.CryptographyService)
        private cryptographyService: CryptographyService,

        @inject(TYPES.ExchangeService)
        private exchangeService: ExchangeService,

        @inject(TYPES.FeeService) @named("Constant")
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
        this.logger.setNamespace("quoteproviderorderservice");
    }

    public async postOrder(order: SignedOrder) {
        const takerAddress = this.amadeusService.getMainAddress();
        await this.ensureAllowance(new BigNumber(order.takerTokenAmount), order.takerTokenAddress, takerAddress);
        await this.exchangeService.fillOrder(order, takerAddress);
    }

    private async ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string): Promise<void> {
        await this.exchangeService.ensureAllowance(amount, tokenAddress, spenderAddress);
    }
}
