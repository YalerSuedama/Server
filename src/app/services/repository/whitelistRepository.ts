export interface WhitelistRepository {
    exists(address: string, activeOnly?: boolean): Promise<boolean>;
}
