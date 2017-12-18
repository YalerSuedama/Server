const ethUtil = require("ethereumjs-util");
import { LoggerService } from "../../app";

export class SignerSubProvider {

    private engine: any;

    public constructor(private privateKey: string, private logger: LoggerService) {
        this.logger.setNamespace("provider");
    }

    public handleRequest(payload: any, next: any, end: any) {
        this.logger.log("payload: %o", payload);
        if (payload.method === "eth_sign") {
            const address = payload.params[0];
            const message = payload.params[1];
            const ecSignature = ethUtil.ecsign(ethUtil.hashPersonalMessage(ethUtil.toBuffer(message)), ethUtil.toBuffer("0x" + this.privateKey));
            const signature = Buffer.concat([ethUtil.toBuffer(ecSignature.v), ethUtil.toBuffer(ecSignature.r), ethUtil.toBuffer(ecSignature.s)], 65);
            end(null, "0x" + signature.toString("hex"));

            return;
        }
        next();
    }

    public setEngine(engine: any) {
        this.engine = engine;
    }

    public emitPayload(payload: any, cb: any) {
        this.engine.sendAsync(this.createPayload(payload), cb);
    }

    private getRandomId(length?: number) {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        const charsLength = chars.length;
        let randomId = "";

        if (!length) {
            length = 20;
        }

        for (let i = 0; i < length; i++) {
            randomId += chars[Math.floor(Math.random() * charsLength)];
        }
        return randomId;
    }

    private createPayload(data: any) {
        return this.extend({
            // defaults
            id: this.getRandomId(),
            jsonrpc: "2.0",
            params: [],
            // user-specified
        }, data);
    }

    private extend(source: any, target: any): any {
        for (const key in source) {
            if (Object.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }
}
