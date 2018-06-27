import { injectable } from "inversify";
import { WhitelistRepository } from "src/app";
import { WhitelistService } from "src/app/services/whiteListService";

@injectable()
export class FromCacheWhiteListRepository implements WhitelistRepository, WhitelistService {
    private static cachedAddresses: any = {};
    private static all = false;

    public async exists(address: string): Promise<boolean> {
        if (FromCacheWhiteListRepository.all) {
            return true;
        }
        if (!address) {
            return false;
        }
        return FromCacheWhiteListRepository.cachedAddresses[address];
    }

    public async setWhiteList(addresses: string[]): Promise<void> {
        if (addresses.length === 1 && addresses[0] === "all") {
            FromCacheWhiteListRepository.all = true;
            return;
        }
        FromCacheWhiteListRepository.all = false;
        const temp: any = {};
        addresses.forEach((address) => {
            temp[address] = true;
        });
        FromCacheWhiteListRepository.cachedAddresses = temp;
    }

    public async getWhiteList(): Promise<string[]> {
        const result = [];
        for (const key in FromCacheWhiteListRepository.cachedAddresses) {
            if (FromCacheWhiteListRepository.cachedAddresses.hasOwnProperty(key)) {
                result.push(key);
            }
        }
        return result;
    }
}
