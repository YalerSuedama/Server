import * as debug from "debug";
import { injectable } from "inversify";
import { LoggerService } from "../../app/services";

const rootNamespace = "amadeusrelay:";

@injectable()
export class LoggerDebug implements LoggerService {
    private debugger: debug.IDebugger;

    constructor() {
        this.setNamespace("LoggerService");
    }

    public setNamespace(namespace: string): void {
        this.debugger = debug(rootNamespace + namespace);
    }

    public log(message: string, ...args: any[]): void {
        args.unshift(message);
        this.debugger.apply(this, args);
    }

    public clone(): LoggerService {
        return new LoggerDebug();
    }
}
