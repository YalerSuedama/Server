export interface WhitelistRepository {
    setWhiteList(addresses: string[]): Promise<void>;
    getWhiteList(): Promise<string[]>;
}
