import * as config from "config";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, JobRunner, JobTask, LiquidityService, LoggerService, OrderService, PaginationService, RequestLimitService, SaltService, TickerRepository, TickerService, TimeService, TokenPairsService, TokenService, TYPES, ValidationService } from "../../../app";
import { AccountPercentageLiquidityService, CachedRequestLimitService, ConstantFeeService, FillTickerTask, FromCacheTickerService, FromCoinMarketCapTickerService, FromConfigAmadeusService, FromConfigTickerService, FromRelayerOrderService, FromRelayerTickerService, FromZeroExTickerService, LoggerDebug, ManagerOrderService, ReserveManagerOrderService, SetIntervalJobRunner, TimeServiceImpl, TokensWithLiquidityTokenPairsService, ZeroExFeeService, ZeroExSchemaBasedValidationService, ZeroExWrapper } from "../../../domain";
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
    bind<FeeService>(TYPES.FeeService).to(ZeroExFeeService).whenTargetNamed("ZeroEx");
    bind<FeeService>(TYPES.FeeService).to(ConstantFeeService).whenTargetNamed("Constant");
    bind<JobRunner>(TYPES.JobRunner).to(SetIntervalJobRunner).inSingletonScope();
    bind<JobTask>(TYPES.JobTask).to(FillTickerTask);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(ManagerOrderService).whenTargetIsDefault();
    bind<OrderService>(TYPES.OrderService).to(FromRelayerOrderService).whenTargetNamed("Relayer");
    bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService).whenTargetNamed("Amadeus");
    bind<interfaces.Factory<OrderService>>(TYPES.OrderFactory).toFactory((context: interfaces.Context) => {
        return (url: string) => {
            context.container.bind<string>(TYPES.OrderRelayerUrl).toConstantValue(url);
            const orderService = context.container.getNamed(TYPES.OrderService, "Relayer");
            context.container.unbind(TYPES.OrderRelayerUrl);
            return orderService;
        };
    });
    bind(PaginationService).toSelf();
    bind<RequestLimitService>(TYPES.RequestLimitService).to(CachedRequestLimitService).inSingletonScope();
    bind<SaltService>(TYPES.SaltService).to(ZeroExWrapper).inSingletonScope();
    bind<TickerRepository>(TYPES.TickerRepository).to(FromCacheTickerService);
    bind<TickerService>(TYPES.TickerService).to(FromZeroExTickerService).whenTargetIsDefault();
    bind<TickerService>(TYPES.TickerService).to(FromCacheTickerService).whenTargetNamed("Repository");
    bind<TickerService>(TYPES.TickerService).to(FromCoinMarketCapTickerService).whenTargetNamed("CMC");
    bind<TickerService>(TYPES.TickerService).to(FromRelayerTickerService).whenTargetNamed("Relayer");
    bind<TickerService>(TYPES.TickerService).to(FromConfigTickerService).whenTargetNamed("Config");
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    bind<TokenService>(TYPES.TokenService).to(ZeroExWrapper).inSingletonScope();
    bind<ValidationService>(TYPES.ValidationService).to(ZeroExSchemaBasedValidationService).inSingletonScope();
});
