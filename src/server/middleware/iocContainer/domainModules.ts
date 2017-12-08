import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import "reflect-metadata";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, LoggerService, OrderService, PaginationService, SaltService, TickerService, TimeService, TokenPairsService, TokenService, TYPES } from "../../../app";
import { AccountPercentageLiquidityService, ConstantFeeService, FromConfigAmadeusService, FromConfigTickerService, LoggerDebug, ReserveManagerOrderService, TimeServiceImpl, TokensWithLiquidityTokenPairsService, ZeroExWrapper } from "../../../domain";
import { OrderController } from "../../controllers/orderController";
import { TokenPairsController } from "../../controllers/tokenPairsController";

export const domainModules = new ContainerModule((bind: interfaces.Bind) => {
    // Controllers
    bind<OrderController>(OrderController).toSelf();
    bind<TokenPairsController>(TokenPairsController).toSelf();

    // Services
    const zeroExWrapper = new ZeroExWrapper();
    bind<AmadeusService>(TYPES.AmadeusService).to(FromConfigAmadeusService);
    bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(zeroExWrapper);
    bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(zeroExWrapper);
    bind<FeeService>(TYPES.FeeService).to(ConstantFeeService);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<LoggerService>(TYPES.LoggerService).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    bind(PaginationService).toSelf();
    bind<SaltService>(TYPES.SaltService).toConstantValue(zeroExWrapper);
    bind<TickerService>(TYPES.TickerService).to(FromConfigTickerService);
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TokenPairsService>(TYPES.TokenPairsService).to(TokensWithLiquidityTokenPairsService);
    bind<TokenService>(TYPES.TokenService).toConstantValue(zeroExWrapper);

    // Repositories
});
