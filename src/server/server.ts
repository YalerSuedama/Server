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
    public expressServerHttps: express.Application;
    public expressServerHttp: express.Application;
    private isListeningHttps: boolean = false;
    private isListeningHttp: boolean = false;
    private useDNSValidator: boolean;
    private useHttps: boolean;
    private useHttp: boolean;
    private logger: Logger;

    constructor() {
        this.logger = iocContainer.get<Logger>(TYPES.Logger);
        this.logger.setNamespace("Server");

        this.useHttps = config.get("server.useHttps");
        if (this.useHttps) {
            this.expressServerHttps = express();
            this.configureServer(this.expressServerHttps);
            RegisterRoutes(this.expressServerHttps);
        }

        this.useDNSValidator = config.get("DNSValidator.active");
        this.useHttp = config.get("server.useHttp");
        if (this.useHttp || this.useDNSValidator) {
            this.expressServerHttp = express();
            if (this.useDNSValidator) {
                this.configureDNSValidator(this.expressServerHttp);
            }
            if (this.useHttp) {
                this.configureServer(this.expressServerHttp);
                RegisterRoutes(this.expressServerHttp);
            }
        }
    }

    public start(): void {
        if (this.useHttps) {
            this.startHttps();
        }
        if (this.useHttp || this.useDNSValidator) {
            this.startHttp();
        }
    }

    private startHttps(): void {
        const port = parseInt(config.get("server.port-https"), 10);
        let hostname: string = null;
        if (config.has("server.hostname")) {
            hostname = config.get("server.hostname") as string;
        }
        if (this.isListeningHttps) {
            throw new Error("Server is already started.");
        }

        const server = https.createServer({
            key  : fs.readFileSync("ssl/backend.key"),
            cert : fs.readFileSync("ssl/backend.crt"),
            ca : [ fs.readFileSync("ssl/backendca.crt") ]},
            this.expressServerHttps).listen(port, hostname, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListeningHttps = true;
            const expressHost = server.address();
            this.logger.log(`
    ------------
    Server started: https://${expressHost.address}:${expressHost.port}
    Health: https://${expressHost.address}:${expressHost.port}/ping
    Swagger Spec: https://${expressHost.address}:${expressHost.port}/api-docs
    ------------`);
        });
    }

    private startHttp(): void {
        const port = parseInt(config.get("server.port-http"), 10);
        let hostname: string = null;
        if (config.has("server.hostname")) {
            hostname = config.get("server.hostname") as string;
        }
        if (this.isListeningHttp) {
            throw new Error("Server is already started.");
        }

        const server = this.expressServerHttp.listen(port, hostname, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListeningHttp = true;
            const expressHost = server.address();
            this.logger.log(`
    ------------`);
            if (this.useHttp) {
                this.logger.log(`    Server started: http://${expressHost.address}:${expressHost.port}
    Health: http://${expressHost.address}:${expressHost.port}/ping
    Swagger Spec: http://${expressHost.address}:${expressHost.port}/api-docs`);
            }
            if (this.useDNSValidator) {
                this.logger.log(`    DNS Validator started: http://${expressHost.address}:${expressHost.port}`);
            }
            this.logger.log(`    ------------`);
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
        app.get(config.get("DNSValidator.path"), (req, res) => {
            this.logger.log("DNS checker called");
            res.send(config.get("DNSValidator.response"));
        });
    }
}
