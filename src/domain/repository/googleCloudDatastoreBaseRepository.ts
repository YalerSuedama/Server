import * as DataStore from "@google-cloud/datastore";
import * as config from "config";
import { injectable } from "inversify";

@injectable()
export abstract class GoogleCloudDatastoreBaseRepository {
    protected datastore: DataStore;

    constructor() {
        const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const projectId = config.get<string>("cloud.project-id");
        this.datastore = new DataStore({ projectId, keyFilename });
    }
}
