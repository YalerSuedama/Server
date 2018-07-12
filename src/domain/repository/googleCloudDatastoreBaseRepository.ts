import * as DataStore from "@google-cloud/datastore";
import * as config from "config";
import { injectable } from "inversify";
import * as loadJsonFile from "load-json-file";

@injectable()
export abstract class GoogleCloudDatastoreBaseRepository {
    protected datastore: DataStore;

    constructor() {
        const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const keyFile = loadJsonFile.sync(keyFilename);

        this.datastore = new DataStore({ projectId: keyFile.project_id, keyFilename });
    }

    protected async getConfigurationDataStore(): Promise<any> {
        const configurationKey = this.getConfigurationKey();
        return await this.datastore.get(configurationKey);
    }

    protected getConfigurationKey(): any {
        return this.datastore.key(["Configuration", config.get("datastore.configurationKey")]);
    }
}
