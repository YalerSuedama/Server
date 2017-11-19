import { ZeroEx } from "0x.js";
import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import * as _ from "lodash";
import { CryptographyService, ExchangeService, SaltService, TokenService } from "../../app";
import { Order, SignedOrder, Token as Token } from "../../app/models";
import * as Utils from "../util";
import { Web3Factory } from "../util";
const Web3JS = require("web3");

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService, TokenService {
    private static readonly TRADABLE_TOKENS_KEY = "tradableTokens";
    private static readonly DEFAULT_TOKENS = ["WETH", "ZRX", "GNT"];
    private static readonly privateKey = config.get("amadeus.privateKey") as string;
    private web3: Web3JS;
    private zeroEx: ZeroEx;

    constructor() {
        setTimeout(() => this.init(), 10);
    }

    public init() {
        this.web3 = new Web3Factory().createWeb3(ZeroExWrapper.privateKey);
        this.zeroEx = new ZeroEx(this.web3.currentProvider);
    }

    /** CryptographyService */

    public async signOrder(order: Order): Promise<SignedOrder> {
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
        return this.zeroEx.token.getBalanceAsync(token.address, address);
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

    public async ensureAllowance(amount: BigNumber, tokenAddress: string, spenderAddress: string): Promise<void> {
        const alowancedValue = await this.zeroEx.token.getProxyAllowanceAsync(tokenAddress, spenderAddress);
        if (alowancedValue.comparedTo(amount) < 0) {
            const tx = await this.zeroEx.token.setProxyAllowanceAsync(tokenAddress, spenderAddress, amount.mul(2));
            await this.zeroEx.awaitTransactionMinedAsync(tx);
        }
    }

    /** Private methods */

    private getTradableTokens(): string[] {
        if (config.has(ZeroExWrapper.TRADABLE_TOKENS_KEY)) {
            return config.get(ZeroExWrapper.TRADABLE_TOKENS_KEY) as string[];
        }
        return ZeroExWrapper.DEFAULT_TOKENS;
    }

    private async isWETHAddress(address: string): Promise<boolean> {
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
