import { ValidationErrorModel } from "src/server/middleware/errorHandler";
import { ErrorCode } from "src/server/middleware/errorHandler/errorCode";
import { ValidationErrorCode } from "src/server/middleware/errorHandler/validationErrorCode";

export interface ErrorModel {
    code: ErrorCode;
    reason: string;
    validationErrors: ValidationErrorModel[];
}
