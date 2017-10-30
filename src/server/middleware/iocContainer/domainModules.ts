import * as debug from "debug";
import { Container, ContainerModule, decorate, injectable, interfaces } from "inversify";
import "reflect-metadata";
import { Controller } from "tsoa";
import { Logger, OrderService, TYPES } from "../../../app";
import { OrderServiceImpl } from "../../../domain";
import { OrderController } from "../../controllers/orderController";
import { LoggerDebug } from "../common/loggerDebug";

export const domainModules = new ContainerModule((bind: interfaces.Bind) => {
    // Controllers
    bind<OrderController>(OrderController).toSelf();

    // Services
    bind<Logger>(TYPES.Logger).to(LoggerDebug);
    bind<OrderService>(TYPES.OrderService).to(OrderServiceImpl);

    // Repositories
});
