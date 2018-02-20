import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, JobRunner, JobTask, LiquidityService, LoggerService, OrderService, PaginationService, RequestLimitService, SaltService, TickerRepository, TickerService, TimeService, TokenPairsService, TokenService, TYPES, ValidationService } from "../../../app";
import { AccountPercentageLiquidityService, CachedRequestLimitService, ConstantFeeService, FillTickerTask, FromCacheTickerService, FromCoinMarketCapTickerService, FromConfigAmadeusService, FromConfigTickerService, FromManagerTickerService, FromRelayerTickerService, LoggerDebug, ReserveManagerOrderService, SetIntervalJobRunner, TimeServiceImpl, TokensWithLiquidityTokenPairsService, ZeroExSchemaBasedValidationService, ZeroExWrapper } from "../../../domain";
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
    bind<JobRunner>(TYPES.JobRunner).to(SetIntervalJobRunner).inSingletonScope();
    bind<JobTask>(TYPES.JobTask).to(FillTickerTask);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    bind(PaginationService).toSelf();
    bind<RequestLimitService>(TYPES.RequestLimitService).to(CachedRequestLimitService).inSingletonScope();
    bind<SaltService>(TYPES.SaltService).to(ZeroExWrapper).inSingletonScope();
    bind<TickerRepository>(TYPES.TickerRepository).to(FromCacheTickerService);
    bind<TickerService>(TYPES.TickerService).to(FromCacheTickerService).whenTargetNamed("Repository");
    bind<TickerService>(TYPES.TickerService).to(FromCoinMarketCapTickerService).whenTargetNamed("CMC");
    bind<TickerService>(TYPES.UrlTickerService).to(FromRelayerTickerService).whenTargetNamed("Relayer");
    bind<TickerService>(TYPES.TickerService).to(FromConfigTickerService).whenTargetNamed("Config");
    bind<TickerService>(TYPES.TickerService).to(FromManagerTickerService).whenTargetNamed("Manager");
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    bind<TokenService>(TYPES.TokenService).to(ZeroExWrapper).inSingletonScope();
    bind<ValidationService>(TYPES.ValidationService).to(ZeroExSchemaBasedValidationService).inSingletonScope();
});
