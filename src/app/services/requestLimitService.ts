import { RequestLimit } from "src/app/models";

export interface RequestLimitService {
    getLimit(ip: string): Promise<RequestLimit>;
}
