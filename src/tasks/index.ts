import * as moment from "moment";
import { JobRunner, TickerService, TYPES } from "../app";
import { iocContainer } from "../server/middleware/iocContainer";
import { FillTickerJob } from "./fillTickerJob";

export function startTasks() {
    iocContainer.get<JobRunner>(TYPES.JobRunner).start(new FillTickerJob());
}
