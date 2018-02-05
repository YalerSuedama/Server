import { Job } from "../../models";

export interface JobRunner
{
    start(...jobs: Job[]): Promise<void>;
    stop(job: Job) : Promise<boolean>;
    stopAll() : Promise<boolean>;
}