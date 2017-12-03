export interface LoggerService {
    setNamespace(namespace: string): void;
    log(message: string, ...args: any[]): void;
}
