import * as webpack from "webpack";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import * as config from "../webpack.dev.config.js";
import { App } from "./App/App";
import port from "./port";

class DevApp extends App {
    private compiler = webpack(config as webpack.Configuration);

    protected configure(): void {
        super.configure();
        this.express.use(webpackDevMiddleware(this.compiler, { noInfo: true, publicPath: config.output.publicPath }));
        this.express.use(webpackHotMiddleware(this.compiler));
    }
}

new DevApp().listen(port);
