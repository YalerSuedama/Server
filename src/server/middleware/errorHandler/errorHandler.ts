import * as express from "express";
import { ValidateError } from "tsoa";
import { ErrorModel } from "./errorModel";

function handleError(res: express.Response, statusCode: number, error: ErrorModel) {
    res.status(statusCode);
    res.json(error);
}

function createErrorFromValidateError(validateError: ValidateError): ErrorModel {
    const errors: string[] = [];
    const errorFields = validateError.fields;
    for (const field in errorFields) {
        if (errorFields.hasOwnProperty(field)) {
            errors.push(`${field}: ${validateError.fields[field].message}`);
        }
    }

    return {
        message: `Invalid parameters: [ ${errors.join(", ")} ]`,
    };
}

function createGenericError(error: any): ErrorModel {
    const message: string = error.message || `Error executing the operation: ${JSON.stringify(error)}`;
    return {
        message,
    };
}

export function errorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (error instanceof ValidateError) {
        handleError(res, 400, createErrorFromValidateError(error));
    } else {
        handleError(res, 500, createGenericError(error));
    }
}
