import * as express from "express";
import { BusinessException, ParameterException } from "../../../domain/exception";
import { ErrorCode } from "./errorCode";
import { ErrorModel } from "./errorModel";
import { SimpleErrorModel } from "./simpleErrorModel";

function handleError(res: express.Response, statusCode: number, error: any) {
    res.status(statusCode);
    res.json(error);
}

function createGenericError(error: any): SimpleErrorModel {
    const message: string = error.message || `Error executing the operation: ${JSON.stringify(error)}`;
    return {
        code: ErrorCode​​.UnknownError,
        reason: message,
    };
}

function createFromParameterException(error: ParameterException): ErrorModel {
    return {
        code: error.code,
        reason: error.message,
        validationErrors: error.validationErrors,
    };
}

function createFromBusinessException(error: BusinessException): SimpleErrorModel {
    return {
        code: error.code,
        reason: error.message,
    };
}

export function errorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (error instanceof ParameterException) {
        handleError(res, 400, createFromParameterException(error));
    } else if (error instanceof BusinessException) {
        handleError(res, 400, createFromBusinessException(error));
    } else {
        handleError(res, 500, createGenericError(error));
    }
}
