import * as config from "config";
import { inject, injectable, named } from "inversify";
import * as moment from "moment";
import { WhitelistService } from "src/app/services/whiteListService";
import { JobTask, TYPES, WhitelistRepository } from "../../../../app";

@injectable()
export class FillConfigurationTask implements JobTask {

    public constructor(
        @inject(TYPES.WhitelistRepository) @named("Cache") private whitelistCache: WhitelistRepository,
        @inject(TYPES.WhitelistRepository) @named("Google") private whitelistSource: WhitelistRepository,
    ) {
    }

    public getName(): string {
        return "Fill ticker";
    }

    public getInterval(): moment.Duration {
        return moment.duration(5, "minutes");
    }

    public async doTask(): Promise<void> {
        const addresses: string[] = await this.whitelistSource.getWhiteList();
        this.whitelistCache.setWhiteList(addresses);
    }
}
