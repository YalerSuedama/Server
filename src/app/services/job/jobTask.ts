import * as moment from "moment";

export interface JobTask {
    getName(): string;
    getInterval(): moment.Duration;
    doTask(): Promise<void>;
}
