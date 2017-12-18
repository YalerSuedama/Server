import * as debug from "debug";
import { injectable } from "inversify";
import { Logger } from "../../../app/services";

const rootNamespace = "amadeusrelay:";

@injectable()
export class LoggerDebug implements Logger {
    private debugger: debug.IDebugger;

    constructor() {
        this.setNamespace("Logger");
    }

    public setNamespace(namespace: string): void {
        this.debugger = debug(rootNamespace + namespace);
    }

    public log(message: string): void {
        this.debugger(message);
    }
}
