import * as bodyParser from "body-parser";
import * as config from "config";
import * as cors from "cors";
import * as express from "express";
import * as health from "express-ping";
import * as fs from "fs";
import * as https from "https";
import * as swaggerUI from "swagger-ui-express";
import { Logger, TYPES } from "../app";
import { analytics } from "./middleware/analytics/analytics";
import { iocContainer } from "./middleware/iocContainer";
import { RegisterRoutes } from "./middleware/routes/routes";
import * as swaggerJSON from "./swagger/swagger.json";

export class Server {
    public expressServer: express.Application;
    public expressDNSValidator: express.Application;
    private isListeningServer: boolean = false;
    private isListeningDNSValidator: boolean = false;
    private useDNSValidator: boolean;
    private logger: Logger;

    constructor() {
        this.logger = iocContainer.get<Logger>(TYPES.Logger);
        this.logger.setNamespace("Server");
        this.expressServer = express();
        this.configureServer(this.expressServer);
        this.useDNSValidator = config.get("DNSValidator.active");
        if (this.useDNSValidator) {
            this.expressDNSValidator = express();
            this.configureDNSValidator(this.expressDNSValidator);
        }
        RegisterRoutes(this.expressServer);
    }

    public start(): void {
        this.startServer();
        if (this.useDNSValidator) {
            this.startDNSValidator();
        }
    }

    private startServer(): void {
        const port = parseInt(config.get("server.port"), 10);
        let hostname: string = null;
        if (config.has("server.hostname")) {
            hostname = config.get("server.hostname") as string;
        }
        if (this.isListeningServer) {
            throw new Error("Server is already started.");
        }

        const server = https.createServer({
            key  : fs.readFileSync("ssl/backend.key"),
            cert : fs.readFileSync("ssl/backend.crt"),
            ca : [ fs.readFileSync("ssl/backendca.crt") ]},
            this.expressServer).listen(port, hostname, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListeningServer = true;
            const expressHost = server.address();
            this.logger.log(`
    ------------
    Server started: https://${expressHost.address}:${expressHost.port}
    Health: https://${expressHost.address}:${expressHost.port}/ping
    Swagger Spec: https://${expressHost.address}:${expressHost.port}/api-docs
    ------------`);
        });
    }

    private startDNSValidator(): void {
        const port = parseInt(config.get("DNSValidator.port"), 10);
        let hostname: string = null;
        if (config.has("DNSValidator.hostname")) {
            hostname = config.get("DNSValidator.hostname") as string;
        }
        if (this.isListeningDNSValidator) {
            throw new Error("Server is already started.");
        }

        const server = this.expressDNSValidator.listen(port, hostname, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListeningDNSValidator = true;
            const expressHost = server.address();
            this.logger.log(`
    ------------
    DNS Validator started: http://${expressHost.address}:${expressHost.port}
    ------------`);
        });
    }

    private configureServer(app: express.Application): void {
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(health.ping());
        app.use(analytics);
        app.use("/swagger.json", express.static(__dirname + "/swagger.json"));
        app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSON));
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err,
            });
        });
    }

    private configureDNSValidator(app: express.Application): void {
        this.logger.log("DNS checker called");
        app.get(config.get("DNSValidator.path"), (req, res) => {
            res.send(config.get("DNSValidator.response"));
        });
    }
}
