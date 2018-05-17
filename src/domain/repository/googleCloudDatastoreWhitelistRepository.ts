import { injectable } from "inversify";
import { WhitelistRepository } from "../../app/services/repository/whitelistRepository";
import { GoogleCloudDatastoreBaseRepository } from "./googleCloudDatastoreBaseRepository";

@injectable()
export class GoogleCloudDatastoreWhitelistRepository extends GoogleCloudDatastoreBaseRepository implements WhitelistRepository {
    public async exists(address: string, activeOnly?: boolean): Promise<boolean> {
        let query = this.datastore.createQuery("Whitelist").filter("address", address);
        if (activeOnly) {
            query = query.filter("active", activeOnly);
        }
        const results = await this.datastore.runQuery(query);
        return results[0] != null && results[0].length > 0;
    }
}
