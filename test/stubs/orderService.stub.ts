import { Container } from "inversify";
import { OrderService, TYPES } from "../../src/app";

const stub: OrderService = {
    listOrders: (tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string) => Promise.resolve(null),
};

export function stubOrderService(iocContainer: Container) {
    iocContainer.bind<OrderService>(TYPES.OrderService).toConstantValue(stub);
}
