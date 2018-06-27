export interface WhitelistService {
    exists(address: string): Promise<boolean>;
}
