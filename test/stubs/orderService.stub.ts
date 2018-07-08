import { Container } from "inversify";
import { OrderService, TYPES } from "../../src/app";

export const orderServiceStub: OrderService = {
    listOrders: (tokenA?: string, tokenB?: string, makerTokenAddress?: string, takerTokenAddress?: string) => Promise.resolve(null),
};

export function orderServiceStubFactory(iocContainer: Container) {
    iocContainer.bind<OrderService>(TYPES.OrderService).toConstantValue(orderServiceStub);
}
