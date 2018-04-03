import * as config from "config";
import * as express from "express";
import "./controllers";
import { RedirectServer } from "./redirectServer";
import { Server } from "./server";

export function startServer() {
    const useHttps: boolean = config.get("server.useHttps");
    const useHttp: boolean = config.get("server.useHttp");

    if (!useHttp && !useHttps) {
        throw new Error("Should configure at least one server: http or https.");
    }

    if (useHttps) {
        new Server(true).start();
    }

    if (useHttp) {
        new Server(false).start();
    } else {
        new RedirectServer().start();
    }
}
