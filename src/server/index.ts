import * as Server from "./server";
import "./server/controllers";

export function startServer() {
    new Server.Server().start();
}
