import { SignedOrder as ZeroExSignedOrder } from "@0xproject/connect";
import { SignedOrder } from "../../app/models";

export function toAmadeusSignedOrders(zeroExSignedOrders: ZeroExSignedOrder[]): SignedOrder[] {
    if (typeof (zeroExSignedOrders) === "undefined" || zeroExSignedOrders == null) {
        return [];
    }

    return zeroExSignedOrders.map<SignedOrder>((signedOrder) => {
        return {
            maker: signedOrder.maker,
            taker: signedOrder.taker,
            makerFee: signedOrder.makerFee.toString(),
            takerFee: signedOrder.takerFee.toString(),
            makerTokenAmount: signedOrder.makerTokenAmount.toString(),
            takerTokenAmount: signedOrder.takerTokenAmount.toString(),
            makerTokenAddress: signedOrder.makerTokenAddress,
            takerTokenAddress: signedOrder.takerTokenAddress,
            salt: signedOrder.salt.toString(),
            exchangeContractAddress: signedOrder.exchangeContractAddress,
            feeRecipient: signedOrder.feeRecipient,
            expirationUnixTimestampSec: signedOrder.expirationUnixTimestampSec.toString(),
            ecSignature: signedOrder.ecSignature,
        };
    });
}
