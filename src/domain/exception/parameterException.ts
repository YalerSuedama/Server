import { ErrorCode, ValidationErrorCode } from "src/server/middleware/errorHandler";

export class ParameterException implements Error {
    public code: ErrorCode;
    public name: string;
    public message: string;
    public stack?: string;
    public validationErrors: Array<{
        field: string,
        code: ValidationErrorCode​​,
        reason: string,
    }>;
}
