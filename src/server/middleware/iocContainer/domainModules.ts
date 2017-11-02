import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import "reflect-metadata";
import { Controller } from "tsoa";
import { AmadeusService, CryptographyService, ExchangeService, FeeService, LiquidityService, Logger, OrderService, SaltService, TimeService, TraderService, TYPES } from "../../../app";
import { AccountPercentageLiquidityService, ConstantAmadeusService, ConstantFeeService, OrderServiceImpl, ReserveManagerTraderService, TimeServiceImpl, ZeroExWrapper } from "../../../domain";
import { OrderController } from "../../controllers/orderController";
import { LoggerDebug } from "../common/loggerDebug";

export const domainModules = new ContainerModule((bind: interfaces.Bind) => {
    // Controllers
    bind<OrderController>(OrderController).toSelf();

    // Services
    const zeroExWrapper = new ZeroExWrapper();
    bind<AmadeusService>(TYPES.AmadeusService).to(ConstantAmadeusService);
    bind<CryptographyService>(TYPES.CryptographyService).toConstantValue(zeroExWrapper);
    bind<ExchangeService>(TYPES.ExchangeService).toConstantValue(zeroExWrapper);
    bind<FeeService>(TYPES.FeeService).to(ConstantFeeService);
    bind<LiquidityService>(TYPES.LiquidityService).to(AccountPercentageLiquidityService);
    bind<Logger>(TYPES.Logger).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(OrderServiceImpl);
    bind<SaltService>(TYPES.SaltService).toConstantValue(zeroExWrapper);
    bind<TimeService>(TYPES.TimeService).to(TimeServiceImpl);
    bind<TraderService>(TYPES.TraderService).to(ReserveManagerTraderService);

    // Repositories
});
