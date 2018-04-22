import { SignedOrder as ZeroExSignedOrder } from "@0xproject/connect";
import { BigNumber } from "bignumber.js";
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

export function fromAmadeusSignedOrders(amadeusSignedOrders: SignedOrder[]): ZeroExSignedOrder[] {
    if (typeof (amadeusSignedOrders) === "undefined" || amadeusSignedOrders === null) {
        return [];
    }

    return amadeusSignedOrders.map<ZeroExSignedOrder>((signedOrder) => {
        return {
            ecSignature: signedOrder.ecSignature,
            exchangeContractAddress: signedOrder.exchangeContractAddress,
            expirationUnixTimestampSec: new BigNumber(signedOrder.expirationUnixTimestampSec),
            feeRecipient: signedOrder.feeRecipient,
            maker: signedOrder.maker,
            makerFee: new BigNumber(signedOrder.makerFee),
            makerTokenAddress: signedOrder.makerTokenAddress,
            makerTokenAmount: new BigNumber(signedOrder.makerTokenAmount),
            salt: new BigNumber(signedOrder.salt),
            taker: signedOrder.taker,
            takerFee: new BigNumber(signedOrder.takerFee),
            takerTokenAddress: signedOrder.takerTokenAddress,
            takerTokenAmount: new BigNumber(signedOrder.takerTokenAmount),
        };
    });
}
