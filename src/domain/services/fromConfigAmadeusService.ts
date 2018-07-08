import { BigNumber } from "bignumber.js";
import * as config from "config";
import { injectable } from "inversify";
import { AmadeusService } from "../../app";

@injectable()
export class FromConfigAmadeusService implements AmadeusService {
    private readonly address = config.get("amadeus.wallet.address") as string;
    private readonly decimalPlaces = config.has("amadeus.decimalPlaces") ? config.get<number>("amadeus.decimalPlaces") : 6;
    private readonly minimumAmount = config.has("amadeus.minimum") ? new BigNumber(config.get("amadeus.minimum")) : new BigNumber("10000000000000");

    public getPrecision(): number {
        return this.decimalPlaces;
    }

    public getMinimumAmount(): BigNumber {
        return this.minimumAmount;
    }

    public getFeeAddress(): string {
        return this.address;
    }

    public getMainAddress(): string {
        return this.address;
    }
}
