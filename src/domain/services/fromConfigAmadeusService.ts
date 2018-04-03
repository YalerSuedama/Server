import * as config from "config";
import { injectable } from "inversify";
import { AmadeusService } from "../../app";

@injectable()
export class FromConfigAmadeusService implements AmadeusService {
    private readonly address = config.get("amadeus.wallet.address") as string;

    public getFeeAddress(): string {
        return this.address;
    }

    public getMainAddress(): string {
        return this.address;
    }
}
