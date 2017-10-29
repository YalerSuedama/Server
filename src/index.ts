import * as Server from "./server";
import "./server/controllers/orderController";

new Server.Server().start();
