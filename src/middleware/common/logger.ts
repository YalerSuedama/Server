import * as debug from "debug";

export class Logger {
    private debugger: debug.IDebugger;

    constructor(namespace: string) {
        this.debugger = debug(namespace);
    }

    public log(message: string): void {
        this.debugger(message);
    }
}
