export interface Logger {
    setNamespace(namespace: string): void;
    log(message: string): void;
}
