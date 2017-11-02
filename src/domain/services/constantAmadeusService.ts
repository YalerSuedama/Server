import { injectable } from "inversify";
import { AmadeusService } from "../../app";

@injectable()
export class ConstantAmadeusService implements AmadeusService {
    private readonly address = "0x0000000000000000000000000000000000000000";

    public getFeeAddress(): string {
        return this.address;
    }

    public getMainAddress(): string {
        return this.address;
    }
}
