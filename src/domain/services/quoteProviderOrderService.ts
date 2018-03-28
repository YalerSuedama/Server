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

    public async postOrder(order: SignedOrder){
        const takerAddress = this.amadeusService.getMainAddress();
        this.ensureAllowance(new BigNumber(order.takerTokenAmount), order.takerTokenAddress, takerAddress);
        // todo - fill
    }

    public validateTakerAddress(order: SignedOrder): boolean{
        return order.taker == this.amadeusService.getMainAddress();
    }

    public async validateFee(order: SignedOrder) : Promise<boolean>{
        const token = await this.tokenService.getTokenByAddress(order.makerTokenAddress);
        const amadeusFee = await this.feeService.getMakerFee(token);
        return amadeusFee <= new BigNumber(order.makerFee); 
    }

    public async validatePrice(order:SignedOrder): Promise<boolean>{
        const makerToken = await this.tokenService.getTokenByAddress(order.makerTokenAddress);
        const takerToken = await this.tokenService.getTokenByAddress(order.takerTokenAddress);
        const ticker = await this.tickerService.getTicker(makerToken, takerToken);
        const orderPrice = (new BigNumber(order.makerTokenAmount)).dividedBy(new BigNumber(order.takerTokenAmount));
        return ticker.price.comparedTo(orderPrice) >= 1;
    }

    private ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string) {
        this.exchangeService.ensureAllowance(amount, tokenAddress, spenderAddress);
    }
}