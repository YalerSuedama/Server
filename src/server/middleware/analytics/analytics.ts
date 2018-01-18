import * as config from "config";
import * as express from "express";
import * as http from "http";
import { Logger, TYPES } from "../../../app";
import { iocContainer } from "../iocContainer/index";

export function analytics(request: express.Request, response: express.Response, next: express.NextFunction): void {
    try {
        const analyticsConfig: any = config.get("analytics");
        const req = http.request({
            hostname: analyticsConfig.hostname,
            port: analyticsConfig.port,
            path: `${analyticsConfig.url}?${analyticsConfig.payload}${request.originalUrl}`,
            method: analyticsConfig.method,
        });
        req.end();
    } catch (error) {
        const logger = iocContainer.get<Logger>(TYPES.Logger);
        logger.setNamespace("analytics");
        logger.log("error on analytics: " + error.message + ". Error: " + JSON.stringify(error));
    }
    next();
}
