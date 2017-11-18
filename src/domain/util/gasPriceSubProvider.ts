export class GasPriceSubProvider {

    private engine: any;

    public handleRequest(payload: any, next: any, end: any) {
        if (payload.method === "eth_sendTransaction") {
            if (! payload.params[0].gas) {
                payload.params[0].gas = "0x78c0";
                payload.params[0].gasPrice = "0x4a817c800";
            }
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
