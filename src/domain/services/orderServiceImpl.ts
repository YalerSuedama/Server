import { injectable } from "inversify";
import { SignedOrder } from "../../app/models";
import { OrderService } from "../../app/services";

@injectable()
export class OrderServiceImpl implements OrderService {
    public async listOrders(tokenA?: string, tokenB?: string): Promise<SignedOrder[]> {
        return [
            {
                maker: "",
                taker: "",
                makerFee: "",
                takerFee: "",
                makerTokenAmount: "",
                takerTokenAmount: "",
                makerTokenAddress: "",
                takerTokenAddress: "",
                salt: "",
                exchangeContractAddress: "",
                feeRecipient: "",
                expirationUnixTimestampSec: "",
                ecSignature: {
                    r: "", s: "", v: 0,
                },
            },
        ];
    }
}
