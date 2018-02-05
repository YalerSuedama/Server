import * as moment from "moment";

export interface Job {
    name: string;
    interval?: moment.Duration;
    task: () => Promise<void>;
}
