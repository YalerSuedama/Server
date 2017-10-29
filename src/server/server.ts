import * as bodyParser from "body-parser";
import * as config from "config";
import * as express from "express";
import * as health from "express-ping";
import * as swaggerUI from "swagger-ui-express";
import { Logger } from "./middleware/common/logger";
import { RegisterRoutes } from "./middleware/routes/routes";
import * as swaggerJSON from "./swagger/swagger.json";

export class Server {
    public express: express.Application;
    private isListening: boolean = false;
    private logger: Logger = new Logger("server");

    constructor() {
        this.express = express();
        this.configure();
        RegisterRoutes(this.express);
    }

    public start(): void {
        const port = parseInt(config.get("server.port"), 10);
        let hostname: string = null;
        if (config.has("server.hostname")) {
            hostname = config.get("server.hostname") as string;
        }
        if (this.isListening) {
            throw new Error("Server is already started.");
        }

        const server = this.express.listen(port, hostname, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListening = true;
            const expressHost = server.address();
            this.logger.log(`
    ------------
    Server started: http://${expressHost.address}:${expressHost.port}
    Health: http://${expressHost.address}:${expressHost.port}/ping
    Swagger Spec: http://${expressHost.address}:${expressHost.port}/api-docs
    ------------`);
        });
    }

    private configure(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(health.ping());
        this.express.use("/swagger.json", express.static(__dirname + "/swagger.json"));
        this.express.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSON));
        this.express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err,
            });
        });
    }
}
