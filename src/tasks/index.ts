import * as moment from "moment";
import { JobRunner, JobTask, TYPES } from "../app";
import { iocContainer } from "../server/middleware/iocContainer";

export function startTasks() {
    const tasks = iocContainer.getAll<JobTask>(TYPES.JobTask);
    iocContainer.get<JobRunner>(TYPES.JobRunner).start(...tasks);
}
