import * as debug from "debug";
import { injectable } from "inversify";
import { Logger } from "../../../app/services";

@injectable()
export class LoggerDebug implements Logger {
    private debugger: debug.IDebugger;

    constructor() {
        this.setNamespace("Logger");
    }

    public setNamespace(namespace: string): void {
        this.debugger = debug(namespace);
    }

    public log(message: string): void {
        this.debugger(message);
    }
}
