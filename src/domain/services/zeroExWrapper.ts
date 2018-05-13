import { ZeroEx } from "0x.js";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { inject, injectable } from "inversify";
import * as _ from "lodash";
import Web3JS = require("web3");
import { CryptographyService, ExchangeService, LoggerService, SaltService, TokenService, TYPES } from "../../app";
import { Order, SignedOrder, Token as Token } from "../../app/models";
import * as Utils from "../util";
import { fromAmadeusSignedOrders, Web3Factory } from "../util";

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService, TokenService {
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

    /** Private methods */

    private getTradableTokens(): string[] {
        if (config.has(ZeroExWrapper.TRADABLE_TOKENS_KEY)) {
            return Object.keys(config.get(ZeroExWrapper.TRADABLE_TOKENS_KEY));
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
