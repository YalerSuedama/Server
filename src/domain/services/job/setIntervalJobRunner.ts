import { injectable } from "inversify";
import { JobRunner } from "../../../app";
import { Job } from "../../../app/models";


@injectable()
export class SetIntervalJobRunner implements JobRunner {
    private intervals: any = {};

    public async start(...jobs: Job[]) : Promise<void> {
        jobs.forEach(async (job) => {
            if (job.interval) {
                this.intervals[job.name] = setInterval(job.task, job.interval.asMilliseconds());
            }
            else {
                await job.task();
            }
        });
    }

    public async stop(job: Job) : Promise<boolean> {
        if (this.intervals[job.name]) {
            clearInterval(this.intervals[job.name]);
            return true;
        }
        return false;
    }

    public async stopAll() : Promise<boolean> {
        for (const intervalName in this.intervals) {
            if (Object.hasOwnProperty(intervalName)) {
                clearInterval(this.intervals[intervalName]);
            }
        }
        return true;
    }
}
