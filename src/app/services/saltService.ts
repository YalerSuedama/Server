export interface SaltService {
    getSalt(): Promise<string>;
}
