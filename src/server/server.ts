import * as bodyParser from "body-parser";
import * as config from "config";
import * as cors from "cors";
import * as express from "express";
import * as health from "express-ping";
import * as swaggerUI from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { LoggerService, TYPES } from "../app";
import { errorHandler } from "./middleware/errorHandler";
import { iocContainer } from "./middleware/iocContainer";
import requestLimit from "./middleware/requestLimit/requestLimit";
import { RegisterRoutes } from "./middleware/routes/routes";
import * as swaggerJSON from "./swagger/swagger.json";

export class Server {
    public express: express.Application;
    private isListening: boolean = false;
    private logger: LoggerService;

    constructor() {
        this.express = express();
        this.logger = iocContainer.get<LoggerService>(TYPES.LoggerService);
        this.logger.setNamespace("Server");
        this.configure();
        RegisterRoutes(this.express);
        this.express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.logger.log("error with status %d and message '%s': %o", err.status, err.message, err);
            next(err);
        });
        this.express.use(errorHandler);
    }

    public start(): void {
        const port: number = config.get("server.port");
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
        this.express.use(cors());
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(health.ping());
        this.express.use(requestLimit);
        this.express.use("/swagger.json", express.static(__dirname + "/swagger.json"));
        this.express.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSON));
    }
}
