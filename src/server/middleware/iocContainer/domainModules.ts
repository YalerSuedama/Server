import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import "reflect-metadata";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, Logger, OrderService, SaltService, TickerService, TimeService, TokenService, TYPES } from "../../../app";
import { AccountPercentageLiquidityService, ConstantFeeService, FromConfigAmadeusService, FromConfigTickerService, ReserveManagerOrderService, TimeServiceImpl, ZeroExWrapper } from "../../../domain";
import { OrderController } from "../../controllers/orderController";
import { LoggerDebug } from "../common/loggerDebug";

export const domainModules = new ContainerModule((bind: interfaces.Bind) => {
    // Controllers
    bind<OrderController>(OrderController).toSelf();

    // Services
    const zeroExWrapper = new ZeroExWrapper();
    bind<AmadeusService>(TYPES.AmadeusService).to(FromConfigAmadeusService);
    bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(zeroExWrapper);
    bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(zeroExWrapper);
    bind<FeeService>(TYPES.FeeService).to(ConstantFeeService);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<Logger>(TYPES.Logger).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(ReserveManagerOrderService);
    bind<SaltService>(TYPES.SaltService).toConstantValue(zeroExWrapper);
    bind<TickerService>(TYPES.TickerService).to(FromConfigTickerService);
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TokenService>(TYPES.TokenService).toConstantValue(zeroExWrapper);

    // Repositories
});
