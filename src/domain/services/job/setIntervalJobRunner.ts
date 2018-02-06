import { injectable } from "inversify";
import { JobRunner } from "../../../app";
import { Job } from "../../../app/models";

@injectable()
export class SetIntervalJobRunner implements JobRunner {
    private intervals: any = {};

    public async start(...jobs: Job[]): Promise<void> {
        jobs.forEach(async (job) => {
            await job.doTask();
            const interval = job.getInterval();
            if (interval) {
                this.intervals[job.getName()] = setInterval(job.doTask, interval.asMilliseconds());
            }
        });
    }

    public async stop(job: Job): Promise<boolean> {
        if (this.intervals.hasOwnProperty(job.getName())) {
            clearInterval(this.intervals[job.getName()]);
            delete this.intervals[job.getName()];
            return true;
        }
        return false;
    }

    public async stopAll(): Promise<boolean> {
        for (const intervalName in this.intervals) {
            if (this.intervals.hasOwnProperty(intervalName)) {
                clearInterval(this.intervals[intervalName]);
                delete this.intervals[intervalName];
            }
        }
        return true;
    }
}
