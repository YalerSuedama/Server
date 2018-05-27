import { ErrorCode } from "src/server/middleware/errorHandler/errorCode";

export interface SimpleErrorModel {
    code: ErrorCode;
    reason: string;
}
