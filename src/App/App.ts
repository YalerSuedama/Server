import * as bodyParser from "body-parser";
import * as express from "express";

export class App {
    public express: express.Application;
    private isListening: boolean = false;

    constructor() {
        this.express = express();
        this.configure();
        this.configureRoutes();
    }

    public listen(port: number): void {
        if (this.isListening) {
            throw new Error("App is already listening");
        }

        this.express.listen(port, (err: any) => {
            if (err) {
                throw err;
            }
            this.isListening = true;
        });
    }

    protected configure(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    protected configureRoutes(): void {
        const wrap = (fn: any) => (...args: any[]) => fn(...args).catch(args[2]);
        const router = express.Router();
        router.get("/", wrap(async (req: any, res: any, next: any) => {
            res.type("text/plain");
            res.send(`Hello world!`);
        }));
        this.express.use(router);
        this.express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err,
            });
        });
    }
}
