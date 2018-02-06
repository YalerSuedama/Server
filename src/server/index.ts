import "./controllers";
import * as Server from "./server";

export function startServer() {
    new Server.Server().start();
}
