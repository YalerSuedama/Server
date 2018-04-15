import { ErrorCode } from "src/server/middleware/errorHandler";

export class BusinessException implements Error {
    public code: ErrorCode;
    public name: string;
    public message: string;
    public stack?: string;
}
