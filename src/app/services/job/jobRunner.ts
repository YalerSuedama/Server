import { JobTask } from "./jobTask";

export interface JobRunner {
    start(...jobs: JobTask[]): Promise<void>;
    stop(job: JobTask): Promise<boolean>;
    stopAll(): Promise<boolean>;
}
