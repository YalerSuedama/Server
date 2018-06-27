import { ZeroEx } from "0x.js";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { GasService } from "src/app/services/gasService";
import Web3JS = require("web3");
import { CryptographyService, ExchangeService, LoggerService, SaltService, TokenService, TYPES } from "../../app";
import { Order, SignedOrder, Token as Token } from "../../app/models";
import * as Utils from "../util";
import { fromAmadeusSignedOrders, Web3Factory } from "../util";

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService, TokenService, GasService​​ {
    private static readonly TRADABLE_TOKENS_KEY = "amadeus.tokens";
    private static readonly DEFAULT_TOKENS = ["WETH", "ZRX", "GNT"];
    private static readonly privateKey = config.get("amadeus.wallet.privateKey") as string;
    private web3: any;
    private zeroEx: ZeroEx;

    constructor( @inject(TYPES.LoggerService) private loggerService: LoggerService) {
        this.loggerService.setNamespace("zeroexwrapper");
        this.init();
    }

    public init() {
        this.web3 = new Web3Factory().createWeb3(ZeroExWrapper.privateKey, this.loggerService.clone());
        this.zeroEx = new ZeroEx(this.web3.currentProvider, config.get("amadeus.0x"));
    }

    /** CryptographyService */

    public async signOrder(order: Order): Promise<SignedOrder> {
        const hash = ZeroEx.getOrderHashHex({
            exchangeContractAddress: order.exchangeContractAddress,
            expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
            feeRecipient: order.feeRecipient,
            maker: order.maker,
            makerFee: new BigNumber(order.makerFee),
            makerTokenAddress: order.makerTokenAddress,
            makerTokenAmount: new BigNumber(order.makerTokenAmount),
            salt: new BigNumber(order.salt),
            taker: order.taker,
            takerFee: new BigNumber(order.takerFee),
            takerTokenAddress: order.takerTokenAddress,
            takerTokenAmount: new BigNumber(order.takerTokenAmount),
        });
        const signature = await this.zeroEx.signOrderHashAsync(hash, await this.web3.eth.getCoinbase(), false);
        return Object.assign({}, order, { ecSignature: signature });
    }

    public async isValidSignedOrder(signedOrder: SignedOrder): Promise<boolean> {
        const hash = ZeroEx.getOrderHashHex({
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
        });
        if (!ZeroEx.isValidOrderHash(hash)) {
            return false;
        }
        try {
            return ZeroEx.isValidSignature(hash, signedOrder.ecSignature, signedOrder.maker);
        } catch (error) {
            return false;
        }
    }

    /** ExchangeService */

    public async get0xContractAddress(): Promise<string> {
        return this.zeroEx.exchange.getContractAddress();
    }

    public async getBalance(address: string, token?: Token): Promise<BigNumber> {
        return this.zeroEx.token.getBalanceAsync(token.address, address);
    }

    public async ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string): Promise<void> {
        const alowancedValue = await this.zeroEx.token.getProxyAllowanceAsync(tokenAddress, spenderAddress);
        if (alowancedValue.comparedTo(amount) < 0) {
            const tx = await this.zeroEx.token.setUnlimitedProxyAllowanceAsync(tokenAddress, spenderAddress);
            await this.zeroEx.awaitTransactionMinedAsync(tx);
        }
    }

    public async fillOrder(order: SignedOrder, fillerAddress?: string): Promise<void> {
        const zeroExSignedOrder = fromAmadeusSignedOrders([order])[0];
        const tx = await this.zeroEx.exchange.fillOrderAsync(zeroExSignedOrder, zeroExSignedOrder.takerTokenAmount, false, fillerAddress || zeroExSignedOrder.taker);
        await this.zeroEx.awaitTransactionMinedAsync(tx);
    }

    /** SaltService */

    public async getSalt(): Promise<string> {
        return ZeroEx.generatePseudoRandomSalt().toString();
    }

    /** TokenService */

    public async getToken(symbol: string): Promise<Token> {
        return this.zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync(symbol);
    }

    public async getTokenByAddress(address: string): Promise<Token> {
        return (await this.listAllTokens()).find((token) => token.address === address);
    }

    public async listAllTokens(): Promise<Token[]> {
        const tokens = await Promise.all(this.getTradableTokens().map(async (symbol) => this.getToken(symbol)));
        return tokens.filter((token) => token);
    }

    /** GasService */
    public async getGasPrice(): Promise<BigNumber> {
        return new BigNumber(await this.web3.eth.getGasPrice());
    }

    public async getFillOrderGasLimit(): Promise<BigNumber> {
        return new BigNumber(await this.web3.eth.estimateGas({
            data: "0xbc61394a000000000000000000000000fd069fc6aafb5f0b13ae93eaad2128aae25408630000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef7fff64389b814a946f3e92105513705ca6b990000000000000000000000000d0a1e359811322d97991e03f863a0c30c2cf029c000000000000000000000000f60345bcff9feedb98bbdfc996b33cba00ee2c750000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000002b61e04d89c0000000000000000000000000000000000000000000000000000018aa54682aff900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000068507557261f5564e9288b5386d3b8d373de61e259a6bea60fa3c051a1567018d246b6f00000000000000000000000000000000000000000000000000002b61e04d89c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c742cbf2b6fde389ae23121d17f8e09fa19d2f1f7ee91c814100e41e32b4ab25a56327d7bb50f720b2e6817568202697517470eaeafca1dccbcda4556c9c4f100",
            from: "0xf60345bcff9feedb98bbdfc996b33cba00ee2c75",
            to: "0x90fe2af704b34e0224bf2299c838e04d4dcf1364",
        }));
    }

    /** Private methods */

    private getTradableTokens(): string[] {
        if (config.has(ZeroExWrapper.TRADABLE_TOKENS_KEY)) {
            return config.get(ZeroExWrapper.TRADABLE_TOKENS_KEY);
        }
        return ZeroExWrapper.DEFAULT_TOKENS;
    }

    private async isWETHAddress(address: string): Promise<boolean> {
        return this.zeroEx.etherToken.getContractAddressIfExists() === address;
    }

    private async wrapETH(amount: string, address: string): Promise<void> {
        const amountAsBigNumber = new BigNumber(amount);
        const balance = await this.zeroEx.token.getBalanceAsync(this.zeroEx.etherToken.getContractAddressIfExists(), address);
        if (balance.lessThan(amountAsBigNumber)) {
            const tx = await this.zeroEx.etherToken.depositAsync(this.zeroEx.etherToken.getContractAddressIfExists(), amountAsBigNumber.minus(balance), address);
            await this.zeroEx.awaitTransactionMinedAsync(tx);
        }
    }
}
