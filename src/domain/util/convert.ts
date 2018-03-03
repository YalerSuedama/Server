import { SignedOrder as ZeroExSignedOrder } from "@0xproject/connect";
import { SignedOrder } from "../../app/models";

export function toAmadeusSignedOrders(zeroExSignedOrders: ZeroExSignedOrder[]): SignedOrder[] {
    if (typeof (zeroExSignedOrders) === "undefined" || zeroExSignedOrders == null) {
        return [];
    }

    return zeroExSignedOrders.map<SignedOrder>((signedOrder) => {
        return {
            ecSignature: signedOrder.ecSignature,
            exchangeContractAddress: signedOrder.exchangeContractAddress,
            expirationUnixTimestampSec: signedOrder.expirationUnixTimestampSec.toString(),
            feeRecipient: signedOrder.feeRecipient,
            maker: signedOrder.maker,
            makerFee: signedOrder.makerFee.toString(),
            makerTokenAddress: signedOrder.makerTokenAddress,
            makerTokenAmount: signedOrder.makerTokenAmount.toString(),
            salt: signedOrder.salt.toString(),
            taker: signedOrder.taker,
            takerFee: signedOrder.takerFee.toString(),
            takerTokenAddress: signedOrder.takerTokenAddress,
            takerTokenAmount: signedOrder.takerTokenAmount.toString(),
        };
    });
}
