import * as _ from "lodash";

let port: number = 3000;
if (_.isFinite(process.env.PORT)) {
    port = parseInt(process.env.PORT, 10);
}

export default port;
