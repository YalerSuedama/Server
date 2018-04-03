import * as config from "config";
import { Server } from "./server";

export class RedirectServer extends Server {

    constructor() {
        super(false);
    }

    protected configure() {
        this.express.get("*", (req, res) => {
            this.logger.log("Http redirect called");
            const httpPort = ":" + parseInt(config.get("server.port-http"), 10);
            const httpsPort = ":" + parseInt(config.get("server.port-https"), 10);
            let host = req.headers.host;
            if (req.headers.host.toString().indexOf(httpPort) > - 1) {
                host = host.toString().replace(httpPort, httpsPort);
            }
            res.redirect("https://" + host + req.url);
        });
    }
}
