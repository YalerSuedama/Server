import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, LoggerService, OrderService, PaginationService, RequestLimitService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES, ValidationService } from "../../../app";
import { AccountPercentageLiquidityService, CachedRequestLimitService, ConstantFeeService, FromCoinMarketCapTickerService, FromConfigAmadeusService, FromConfigTickerService, FromRelayerTickerService, LoggerDebug, ReserveManagerOrderService, TimeServiceImpl, TokensWithLiquidityTokenPairsService, ZeroExSchemaBasedValidationService, ZeroExWrapper } from "../../../domain";
import { OrderController } from "../../controllers/orderController";
import { TokenPairsController } from "../../controllers/tokenPairsController";

export const domainModules = new ContainerModule((bind: interfaces.Bind) => {
    // Controllers
    bind<OrderController>(OrderController).toSelf();
    bind<TokenPairsController>(TokenPairsController).toSelf();

    // Services
    bind<AmadeusService>(TYPES.AmadeusService).to(FromConfigAmadeusService);
    bind<CryptographyService>(TYPES.CryptographyService).to(ZeroExWrapper).inSingletonScope();
    bind<ExchangeService>(TYPES.ExchangeService).to(ZeroExWrapper).inSingletonScope();
    bind<FeeService>(TYPES.FeeService).to(ConstantFeeService);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    bind(PaginationService).toSelf();
    bind<RequestLimitService>(TYPES.RequestLimitService).to(CachedRequestLimitService).inSingletonScope();
    bind<SaltService>(TYPES.SaltService).to(ZeroExWrapper).inSingletonScope();
    // bind<TickerService>(TYPES.TickerService).to(FromConfigTickerService);
    // bind<TickerService>(TYPES.TickerService).to(FromCoinMarketCapTickerService);
    bind<TickerService>(TYPES.TickerService).to(FromRelayerTickerService);
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    bind<TokenService>(TYPES.TokenService).to(ZeroExWrapper).inSingletonScope();
    bind<ValidationService>(TYPES.ValidationService).to(ZeroExSchemaBasedValidationService).inSingletonScope();

    // Repositories
});
