import * as config from "config";
import * as express from "express";
import * as http from "http";
import { LoggerService, TYPES } from "../../../app";
import { iocContainer } from "../iocContainer/index";

export function analytics(request: express.Request, response: express.Response, next: express.NextFunction): void {
    try {
        const analyticsConfig: any = config.get("analytics");
        if (analyticsConfig.enabled) {
            const req = http.request({
                hostname: analyticsConfig.hostname,
                port: analyticsConfig.port,
                path: `${analyticsConfig.url}?${analyticsConfig.payload}${request.originalUrl}`,
                method: analyticsConfig.method,
            });
            req.end();
        }
    } catch (error) {
        const logger = iocContainer.get<LoggerService>(TYPES.LoggerService);
        logger.setNamespace("analytics");
        logger.log("error on analytics: " + error.message + ". Error: " + JSON.stringify(error));
    }
    next();
}
