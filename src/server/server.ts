import * as DataStore from "@google-cloud/datastore";
import * as bodyParser from "body-parser";
import * as config from "config";
import * as cors from "cors";
import * as express from "express";
import * as health from "express-ping";
import * as fs from "fs";
import * as https from "https";
import * as swaggerUI from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { LoggerService, TYPES } from "../app";
import { analytics } from "./middleware/analytics/analytics";
import { errorHandler } from "./middleware/errorHandler";
import { iocContainer } from "./middleware/iocContainer";
import requestLimit from "./middleware/requestLimit/requestLimit";
import { RegisterRoutes } from "./middleware/routes/routes";
import * as swaggerJSON from "./swagger/swagger.json";

export class Server {
    protected express: express.Application;
    protected logger: LoggerService;
    private isListening: boolean = false;
    private useHttps: boolean;

    constructor(useHttps: boolean) {
        this.useHttps = useHttps;
        this.express = express();
        this.logger = iocContainer.get<LoggerService>(TYPES.LoggerService);
        this.logger.setNamespace("Server");
        if (config.get<boolean>("server.dnsValidator.active")) {
            this.configureDnsValidator();
        }
        this.configure();
        RegisterRoutes(this.express);
        this.express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.logger.log("error with status %d and message '%s': %o", err.status, err.message, err);
            next(err);
        });
        this.express.use(errorHandler);
    }

    public start(): void {
        const port: number = config.get(`server.port-${this.useHttps ? "https" : "http"}`);
        let hostname: string = null;
        if (config.has("server.hostname")) {
            hostname = config.get("server.hostname") as string;
        }
        if (this.isListening) {
            throw new Error("Server is already started.");
        }

        const application = this.useHttps ? https.createServer({
            ca : [ fs.readFileSync("ssl/backendca.crt") ],
            cert : fs.readFileSync("ssl/backend.crt"),
            key  : fs.readFileSync("ssl/backend.key"),
        },
        this.express) : this.express;

        const server = application.listen(port, hostname, (err: any) => {
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

    protected configure(): void {
        this.express.use(cors());
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(health.ping());
        this.express.use(analytics);
        this.express.use(requestLimit);
        this.express.use("/swagger.json", express.static(__dirname + "/swagger.json"));
        this.express.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSON));
        this.express.use("/test-datastore", async (req, res, next) => {
            const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            this.logger.log(`env: ${keyFilename}`);
            const datastore = new DataStore({ projectId: "amadeusrelay-201914" });
            const key = datastore.key(["Configuration", "default"]);
            const objDireto = await datastore.get(key);
            let responseBody = "Direto: " + JSON.stringify(objDireto);
            const ret = await datastore.runQuery(datastore.createQuery("Configuration").filter("whitelist", "0xDf7b8AD1621ca48fbBd52803A750018F7150976B"));
            responseBody += "\r\nQuery: " + JSON.stringify(ret);
            res.status(200);
            res.type(".txt");
            res.send(responseBody);
        });
    }

    protected configureDnsValidator() {
        this.express.get(config.get("server.dnsValidator.path"), (req, res) => {
            this.logger.log("DNS checker called");
            res.send(config.get("server.dnsValidator.response"));
        });
    }
}
