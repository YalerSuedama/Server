import { ZeroEx } from "0x.js";
import * as BigNumber from "bignumber.js";
import { injectable } from "inversify";
import Web3JS = require("web3");
import { CryptographyService, ExchangeService, SaltService } from "../../app";
import { Order, SignedOrder } from "../../app/models";

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService {

    private web3: Web3JS;
    private zeroEx: ZeroEx;

    constructor() {
        this.web3 = new Web3JS(new Web3JS.providers.HttpProvider("http://localhost:8545"));
        this.zeroEx = new ZeroEx(this.web3.currentProvider);
    }

    public async signOrder(order: Order): Promise<SignedOrder> {
        const hash = ZeroEx.getOrderHashHex(order);
        const signature = await this.zeroEx.signOrderHashAsync(hash, await this.web3.eth.getCoinbase());
        return Object.assign({}, order, { ecSignature: signature });
    }
    public async getContractAddress(): Promise<string> {
        return this.zeroEx.exchange.getContractAddressAsync();
    }

    public async getSalt(): Promise<string> {
        return ZeroEx.generatePseudoRandomSalt().toString();
    }
}
