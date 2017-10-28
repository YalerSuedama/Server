declare module "express-ping" {
    export function ping(): (req: any, res: any, next: any) => void;
    export function ping(path: string): (req: any, res: any, next: any) => void;
}

declare module "swagger-ui-express" {
    export function setup(swaggerDoc: any, showExplorer?: boolean): any;
    function serve(root: string, options?: any): any;
}

declare module "*.json" {
    const value: any;
    export default value;
}