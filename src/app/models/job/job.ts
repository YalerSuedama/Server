import * as moment from "moment";

export interface Job {
    getName(): string;
    getInterval(): moment.Duration;
    doTask(): Promise<void>;
}
