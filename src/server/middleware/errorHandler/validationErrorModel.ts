import { ValidationErrorCode } from "src/server/middleware/errorHandler/validationErrorCode";

export interface ValidationErrorModel {
    code: ValidationErrorCode​​;
    field: string;
    reason: string;
}
