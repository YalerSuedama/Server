import * as chai from "chai";
import * as config from "config";
import * as moment from "moment";
import "reflect-metadata";
import * as sinon from "sinon";
import { JobRunner } from "../../../src/app";
import { Job } from "../../../src/app/models";
import { SetIntervalJobRunner } from "../../../src/domain";

const expect = chai.expect;

async function delay(milliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

describe("JobRunner", () => {
    let jobRunner: SetIntervalJobRunner;
    const job: Job = {
        getName: () => "Test job",
        getInterval: () => moment.duration(50, "ms"),
        doTask: async () => { /* Do nothing */ },
    };
    let spy: sinon.SinonSpy;
    beforeEach((done) => {
        jobRunner = new SetIntervalJobRunner();
        spy = sinon.spy(job, "doTask");
        done();
    });
    afterEach((done) => {
        jobRunner.stopAll();
        spy.restore();
        done();
    });
    context("When a job is started", () => {
        it("should call job.doTask.", async () => {
            await jobRunner.start(job);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
        });
        context("And it does have an interval", () => {
            it("should call job.doTask a second time after the required interval.", async () => {
                await jobRunner.start(job);
                // tslint:disable-next-line:no-unused-expression
                expect(spy).to.be.calledOnce;
                await delay(job.getInterval().asMilliseconds() + 10);
                // tslint:disable-next-line:no-unused-expression
                expect(spy).to.be.calledTwice;
            });
        });
        context("And it does not have an interval", () => {
            const jobInner: Job = {
                getName: () => "test",
                getInterval: () => null,
                doTask: async () => { /* do nothing */ },
            };
            let spyInner: sinon.SinonSpy;
            beforeEach((done) => {
                spyInner = sinon.spy(jobInner, "doTask");
                done();
            });
            afterEach((done) => {
                spyInner.restore();
                done();
            });
            it("should call job.doTask only once and do not call it again.", async () => {
                await jobRunner.start(jobInner);
                // tslint:disable-next-line:no-unused-expression
                expect(spyInner).to.be.calledOnce;
                // tslint:disable-next-line:no-unused-expression
                expect(await jobRunner.stop(jobInner)).to.be.not.ok;
            });
        });
    });
    context("When a job is stopped", () => {
        it("should not call job.doTask anymore.", async () => {
            await jobRunner.start(job);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(await jobRunner.stop(job)).to.be.ok;
            await delay(job.getInterval().asMilliseconds() + 10);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(await jobRunner.stop(job)).to.be.not.ok;
        });
        it("should not stop other jobs.", async () => {
            await jobRunner.start(job);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            const jobInner = {
                getName: () => "test",
                getInterval: () => moment.duration(100, "ms"),
                doTask: async () => { /* do nothing */ },
            };
            const spyInner = sinon.spy(jobInner, "doTask");
            await jobRunner.start(jobInner);
            // tslint:disable-next-line:no-unused-expression
            expect(spyInner).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(await jobRunner.stop(job)).to.be.ok;
            await delay(jobInner.getInterval().asMilliseconds() + 10);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(spyInner).to.be.calledTwice;
            spyInner.restore();
        });
    });
    context("When all jobs are stopped", () => {
        it("should not call job.doTask anymore for all the jobs.", async () => {
            await jobRunner.start(job);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            const jobInner = {
                getName: () => "test",
                getInterval: () => moment.duration(100, "ms"),
                doTask: async () => { /* do nothing */ },
            };
            const spyInner = sinon.spy(jobInner, "doTask");
            await jobRunner.start(jobInner);
            // tslint:disable-next-line:no-unused-expression
            expect(spyInner).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(await jobRunner.stopAll()).to.be.ok;
            await delay(jobInner.getInterval().asMilliseconds() + 10);
            // tslint:disable-next-line:no-unused-expression
            expect(spy).to.be.calledOnce;
            // tslint:disable-next-line:no-unused-expression
            expect(spyInner).to.be.calledOnce;
            spyInner.restore();
        });
    });
});
