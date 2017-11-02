import * as BigNumber from "bignumber.js";
import { injectable } from "inversify";
import { CryptographyService, ExchangeService, SaltService } from "../../app";
import { Order, SignedOrder } from "../../app/models";

@injectable()
export class ZeroExWrapper implements CryptographyService, ExchangeService, SaltService {
    public async signOrder(order: Order): Promise<SignedOrder> {
        return Object.assign({}, order, { ecSignature: { r: "", s: "", v: 1 } });
    }
    public async getContractAddress(): Promise<string> {
        return "0x0000000000000000000000000000000000000000";
    }

    public async getSalt(): Promise<string> {
        return new BigNumber(Math.floor(Math.random() * (999999999999 + 1))).toString();
    }
}
