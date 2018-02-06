import * as config from "config";
import * as moment from "moment";
import { TickerService, TokenService, TYPES } from "../app";
import { Job } from "../app/models";
import { FromCacheTickerService } from "../domain";
import { iocContainer } from "../server/middleware/iocContainer";

export class FillTickerJob implements Job {

    public getName(): string {
        return "Fill ticker";
    }

    public getInterval(): moment.Duration {
        return moment.duration(5, "minutes");
    }

    public async doTask(): Promise<void> {
        const availableTokens = await iocContainer.get<TokenService>(TYPES.TokenService).listAllTokens();
        for (const from of availableTokens) {
            for (const to of availableTokens.filter((token) => token.symbol !== from.symbol)) {
                const ticker = await iocContainer.getTagged<TickerService>(TYPES.TickerService, "source", "CMC").getTicker(from, to);
                if (ticker) {
                    await iocContainer.get<FromCacheTickerService>(FromCacheTickerService).addTicker(ticker);
                }
            }
        }
    }
}
