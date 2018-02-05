import * as moment from "moment";
import { JobRunner, TickerService, TYPES } from "../app";
import { iocContainer } from "../server/middleware/iocContainer";

export function startTasks() {
    iocContainer.get<JobRunner>(TYPES.JobRunner).start({
        name: "create tickers",
        interval: moment.duration(5, "minutes"),
        task: async () => {
            iocContainer.getNamed<TickerService>(TYPES.TickerService, "CoinMarketCap").getTicker(null, null);
        },
    });
}
