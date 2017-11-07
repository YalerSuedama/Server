import { ZeroEx } from "0x.js";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import * as _ from "lodash";
import Web3JS = require("web3");
import { CryptographyService, ExchangeService, SaltService, TokenService } from "../../app";
import { Order, SignedOrder, Token as Token } from "../../app/models";
import * as Utils from "../util";

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService, TokenService {
    private static readonly TRADABLE_TOKENS_KEY = "tradableTokens";
    private static readonly DEFAULT_TOKENS = ["ETH", "ZRX", "OMG"];

    private web3: Web3JS;
    private zeroEx: ZeroEx;
    private ethAddress: string;

    constructor() {
        this.web3 = new Web3JS(new Web3JS.providers.HttpProvider("http://" + process.env.ETHEREUM_NODE + ":8545"));
        this.zeroEx = new ZeroEx(this.web3.currentProvider);
    }

    /** CryptographyService */

    public async signOrder(order: Order): Promise<SignedOrder> {
        if (order.maker !== Utils.ZERO_ADDRESS) {
            await this.ensureAllowance(order.makerTokenAmount, order.makerTokenAddress, order.maker);
            if (await this.isETHAddress(order.makerTokenAddress)) {
                await this.wrapETH(order.makerTokenAmount, order.maker);
            }
        }
        if (order.taker !== Utils.ZERO_ADDRESS) {
            await this.ensureAllowance(order.takerTokenAmount, order.takerTokenAddress, order.taker);
            if (await this.isETHAddress(order.takerTokenAddress)) {
                await this.wrapETH(order.takerTokenAmount, order.taker);
            }
        }
        const hash = ZeroEx.getOrderHashHex({
            maker: order.maker,
            taker: order.taker,
            makerFee: new BigNumber(order.makerFee),
            takerFee: new BigNumber(order.takerFee),
            makerTokenAmount: new BigNumber(order.makerTokenAmount),
            takerTokenAmount: new BigNumber(order.takerTokenAmount),
            makerTokenAddress: order.makerTokenAddress,
            takerTokenAddress: order.takerTokenAddress,
            salt: new BigNumber(order.salt),
            exchangeContractAddress: order.exchangeContractAddress,
            feeRecipient: order.feeRecipient,
            expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
        });
        const signature = await this.zeroEx.signOrderHashAsync(hash, await this.web3.eth.getCoinbase());
        return Object.assign({}, order, { ecSignature: signature });
    }

    /** ExchangeService */

    public async get0xContractAddress(): Promise<string> {
        return this.zeroEx.exchange.getContractAddressAsync();
    }

    public async getBalance(address: string, token?: Token): Promise<BigNumber> {
        if (!token || token.symbol === "ETH") {
            return new BigNumber(await this.web3.eth.getBalance(address));
        }
        return this.zeroEx.token.getBalanceAsync(token.address, address);
    }

    /** SaltService */

    public async getSalt(): Promise<string> {
        return ZeroEx.generatePseudoRandomSalt().toString();
    }

    /** TokenService */

    public async getToken(symbol: string): Promise<Token> {
        if (symbol === "ETH") {
            const token = await this.zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync("WETH");
            if (token) {
                token.symbol = symbol;
            }
            return token;
        }
        return this.zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync(symbol);
    }

    public async listAllTokens(): Promise<Token[]> {
        return Promise.all(this.getTradableTokens().map(async (symbol) => this.getToken(symbol)));
    }

    /** Private methods */

    private async ensureAllowance(amount: string, tokenAddress: string, address: string): Promise<void> {
        const tx = await this.zeroEx.token.setUnlimitedProxyAllowanceAsync(tokenAddress, address);
        await this.zeroEx.awaitTransactionMinedAsync(tx);
    }

    private getTradableTokens(): string[] {
        if (config.has(ZeroExWrapper.TRADABLE_TOKENS_KEY)) {
            return config.get(ZeroExWrapper.TRADABLE_TOKENS_KEY) as string[];
        }
        return ZeroExWrapper.DEFAULT_TOKENS;
    }

    private async isETHAddress(address: string): Promise<boolean> {
        return (await this.zeroEx.etherToken.getContractAddressAsync()) === address;
    }

    private async wrapETH(amount: string, address: string): Promise<void> {
        const amountAsBigNumber = new BigNumber(amount);
        const balance = await this.zeroEx.token.getBalanceAsync(await this.zeroEx.etherToken.getContractAddressAsync(), address);
        if (balance.lessThan(amountAsBigNumber)) {
            const tx = await this.zeroEx.etherToken.depositAsync(amountAsBigNumber.minus(balance), address);
            await this.zeroEx.awaitTransactionMinedAsync(tx);
        }
    }
}
