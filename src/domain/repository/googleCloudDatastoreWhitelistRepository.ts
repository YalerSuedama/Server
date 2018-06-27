import { injectable } from "inversify";
import { WhitelistRepository } from "src/app";
import { GoogleCloudDatastoreBaseRepository } from "./googleCloudDatastoreBaseRepository";

@injectable()
export class GoogleCloudDatastoreWhitelistRepository extends GoogleCloudDatastoreBaseRepository implements WhitelistRepository {

    public setWhiteList(addresses: string[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getWhiteList(): Promise<string[]> {
        const configuration: any = await this.getConfigurationDataStore();
        const whitelistEnabled = configuration[0] && configuration[0].whitelistEnabled;
        if (!whitelistEnabled) {
            return ["all"];
        }

        const query = this.datastore.createQuery("Whitelist").hasAncestor(this.getConfigurationKey()).filter("active", true);
        const results = await this.datastore.runQuery(query);
        if (!results || results.length === 0) {
            return [];
        }
        return results[0].map((wl) => (wl as any).address);
    }
}
