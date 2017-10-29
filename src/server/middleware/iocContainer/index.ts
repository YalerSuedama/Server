import { Container, decorate, injectable } from "inversify";
import "reflect-metadata";
import { Controller } from "tsoa";
import { OrderService, TYPES } from "../../../app";
import { OrderServiceImpl } from "../../../domain";
import { OrderController } from "../../controllers/orderController";

decorate(injectable(), Controller);

const iocContainer = new Container();

// Controllers
iocContainer.bind<OrderController>(OrderController).to(OrderController);

// Services
iocContainer.bind<OrderService>(TYPES.OrderService).to(OrderServiceImpl);

// Repositories

export { iocContainer };
