/* tslint:disable */
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../iocContainer';
import { OrderController } from './../../controllers/orderController';
import { TokenPairsController } from './../../controllers/tokenPairsController';
import { FeeController } from './../../controllers/feeController';
import { PostOrderController } from './../../controllers/postOrderController';
import { ParameterValidator } from '../validator/parameterValidator';
import { ValidationAddressParam } from '../validator/validationAddressParam';
import { ValidationErrorModel, ErrorCode } from '../../../server/middleware/errorHandler';
import { ParameterException } from '../../../domain/exception';
import { ValidationService, TYPES } from '../../../app';

const models: TsoaRoute.Models = {
    "ECSignature": {
        "properties": {
            "v": { "dataType": "double", "required": true },
            "r": { "dataType": "string", "required": true },
            "s": { "dataType": "string", "required": true },
        },
    },
    "SignedOrder": {
        "properties": {
            "maker": { "dataType": "string", "required": true },
            "taker": { "dataType": "string", "required": true },
            "makerFee": { "dataType": "string", "required": true },
            "takerFee": { "dataType": "string", "required": true },
            "makerTokenAmount": { "dataType": "string", "required": true },
            "takerTokenAmount": { "dataType": "string", "required": true },
            "makerTokenAddress": { "dataType": "string", "required": true },
            "takerTokenAddress": { "dataType": "string", "required": true },
            "salt": { "dataType": "string", "required": true },
            "exchangeContractAddress": { "dataType": "string", "required": true },
            "feeRecipient": { "dataType": "string", "required": true },
            "expirationUnixTimestampSec": { "dataType": "string", "required": true },
            "ecSignature": { "ref": "ECSignature", "required": true },
        },
    },
    "ErrorCode": {
        "enums": ["100", "101", "102", "103", "500"],
    },
    "ValidationErrorCode": {
        "enums": ["1000", "1001", "1002", "1003", "1004", "1005", "1006"],
    },
    "ValidationErrorModel": {
        "properties": {
            "code": { "ref": "ValidationErrorCode", "required": true },
            "field": { "dataType": "string", "required": true },
            "reason": { "dataType": "string", "required": true },
        },
    },
    "ErrorModel": {
        "properties": {
            "code": { "ref": "ErrorCode", "required": true },
            "reason": { "dataType": "string", "required": true },
            "validationErrors": { "dataType": "array", "array": { "ref": "ValidationErrorModel" }, "required": true },
        },
    },
    "SimpleErrorModel": {
        "properties": {
            "code": { "ref": "ErrorCode", "required": true },
            "reason": { "dataType": "string", "required": true },
        },
    },
    "TokenTradeInfo": {
        "properties": {
            "address": { "dataType": "string", "required": true },
            "minAmount": { "dataType": "string", "required": true },
            "maxAmount": { "dataType": "string", "required": true },
            "precision": { "dataType": "double", "required": true },
        },
    },
    "TokenPairTradeInfo": {
        "properties": {
            "tokenA": { "ref": "TokenTradeInfo", "required": true },
            "tokenB": { "ref": "TokenTradeInfo", "required": true },
        },
    },
    "Fee": {
        "properties": {
            "feeRecipient": { "dataType": "string", "required": true },
            "makerFee": { "dataType": "string", "required": true },
            "takerFee": { "dataType": "string", "required": true },
        },
    },
};

export function RegisterRoutes(app: any) {
    app.get('/api/v0/orders',
        function(request: any, response: any, next: any) {
            const args = {
                exchangeContractAddress: { "in": "query", "name": "exchangeContractAddress", "dataType": "string" },
                tokenAddress: { "in": "query", "name": "tokenAddress", "dataType": "string" },
                makerTokenAddress: { "in": "query", "name": "makerTokenAddress", "dataType": "string" },
                takerTokenAddress: { "in": "query", "name": "takerTokenAddress", "dataType": "string" },
                maker: { "in": "query", "name": "maker", "dataType": "string" },
                taker: { "in": "query", "name": "taker", "dataType": "string" },
                trader: { "in": "query", "name": "trader", "dataType": "string" },
                feeRecipient: { "in": "query", "name": "feeRecipient", "dataType": "string" },
                page: { "in": "query", "name": "page", "dataType": "integer", "validators": { "isInt": { "errorMsg": "page" }, "minimum": { "value": 1 } } },
                perPage: { "in": "query", "name": "per_page", "dataType": "integer", "validators": { "isInt": { "errorMsg": "perPage" }, "minimum": { "value": 1 }, "maximum": { "value": 100 } } },
            };

            const controller = iocContainer.get<OrderController>(OrderController);

            getValidatedArgs(args, request, controller).then((validatedArgs) => {
                if (typeof controller['setStatus'] === 'function') {
                    (<any>controller).setStatus(undefined);
                }

                const promise = controller.listOrders.apply(controller, validatedArgs);
                promiseHandler(controller, promise, response, next);
            }).catch((error: any) => next(error));
        });
    app.get('/api/v0/token_pairs',
        function(request: any, response: any, next: any) {
            const args = {
                tokenA: { "in": "query", "name": "tokenA", "dataType": "string" },
                tokenB: { "in": "query", "name": "tokenB", "dataType": "string" },
                page: { "in": "query", "name": "page", "dataType": "integer", "validators": { "isInt": { "errorMsg": "page" }, "minimum": { "value": 1 } } },
                perPage: { "in": "query", "name": "per_page", "dataType": "integer", "validators": { "isInt": { "errorMsg": "perPage" }, "minimum": { "value": 1 }, "maximum": { "value": 100 } } },
            };

            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);

            getValidatedArgs(args, request, controller).then((validatedArgs) => {
                if (typeof controller['setStatus'] === 'function') {
                    (<any>controller).setStatus(undefined);
                }

                const promise = controller.listPairs.apply(controller, validatedArgs);
                promiseHandler(controller, promise, response, next);
            }).catch((error: any) => next(error));
        });
    app.post('/api/v0/fees',
        function(request: any, response: any, next: any) {
            const args = {
                exchangeContractAddress: { "in": "body-prop", "name": "exchangeContractAddress", "required": true, "dataType": "string" },
                makerTokenAddress: { "in": "body-prop", "name": "makerTokenAddress", "required": true, "dataType": "string" },
                takerTokenAddress: { "in": "body-prop", "name": "takerTokenAddress", "required": true, "dataType": "string" },
                maker: { "in": "body-prop", "name": "maker", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "makerTokenAmount" } } },
                taker: { "in": "body-prop", "name": "taker", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "takerTokenAmount" } } },
                expirationUnixTimestampSec: { "in": "body-prop", "name": "expirationUnixTimestampSec", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "expirationUnixTimestampSec" } } },
                salt: { "in": "body-prop", "name": "salt", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "salt" } } },
                makerTokenAmount: { "in": "body-prop", "name": "makerTokenAmount", "dataType": "string", "validators": { "isInt": { "errorMsg": "makerTokenAmount" } } },
                takerTokenAmount: { "in": "body-prop", "name": "takerTokenAmount", "dataType": "string", "validators": { "isInt": { "errorMsg": "takerTokenAmount" } } },
            };

            const controller = iocContainer.get<FeeController>(FeeController);

            getValidatedArgs(args, request, controller).then((validatedArgs) => {
                if (typeof controller['setStatus'] === 'function') {
                    (<any>controller).setStatus(undefined);
                }

                const promise = controller.calculateFee.apply(controller, validatedArgs);
                promiseHandler(controller, promise, response, next);
            }).catch((error: any) => next(error));
        });
    app.post('/api/v0/order',
        function(request: any, response: any, next: any) {
            const args = {
                ecSignature: { "in": "body-prop", "name": "ecSignature", "required": true, "ref": "ECSignature" },
                maker: { "in": "body-prop", "name": "maker", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "makerTokenAmount" } } },
                taker: { "in": "body-prop", "name": "taker", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "takerTokenAmount" } } },
                makerFee: { "in": "body-prop", "name": "makerFee", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "makerFee" } } },
                takerFee: { "in": "body-prop", "name": "takerFee", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "takerFee" } } },
                makerTokenAmount: { "in": "body-prop", "name": "makerTokenAmount", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "makerTokenAmount" } } },
                takerTokenAmount: { "in": "body-prop", "name": "takerTokenAmount", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "takerTokenAmount" } } },
                makerTokenAddress: { "in": "body-prop", "name": "makerTokenAddress", "required": true, "dataType": "string" },
                takerTokenAddress: { "in": "body-prop", "name": "takerTokenAddress", "required": true, "dataType": "string" },
                salt: { "in": "body-prop", "name": "salt", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "salt" } } },
                exchangeContractAddress: { "in": "body-prop", "name": "exchangeContractAddress", "required": true, "dataType": "string" },
                feeRecipient: { "in": "body-prop", "name": "feeRecipient", "required": true, "dataType": "string" },
                expirationUnixTimestampSec: { "in": "body-prop", "name": "expirationUnixTimestampSec", "required": true, "dataType": "string", "validators": { "isInt": { "errorMsg": "expirationUnixTimestampSec" } } },
            };

            const controller = iocContainer.get<PostOrderController>(PostOrderController);

            getValidatedArgs(args, request, controller).then((validatedArgs) => {
                if (typeof controller['setStatus'] === 'function') {
                    (<any>controller).setStatus(undefined);
                }

                const promise = controller.postOrder.apply(controller, validatedArgs);
                promiseHandler(controller, promise, response, next);
            }).catch((error: any) => next(error));
        });


    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (controllerObj instanceof Controller) {
                    const controller = controllerObj as Controller
                    const headers = controller.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controller.getStatus();
                }

                if (data) {
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch((error: any) => next(error));
    }

    async function getValidatedArgs(args: any, request: any, controller: any): Promise<any[]> {
        const fieldErrors: FieldErrors = {};
        const addressParameters: ValidationAddressParam[] = controller.getAddressParameters ? controller.getAddressParameters() : [];
        const validationErrors: ValidationErrorModel[] = [];
        const validationService = iocContainer.get<ValidationService>(TYPES.ValidationService);
        let ok = true;
        let value: any;
        let parent: string;
        const values: any[] = [];
        for (var i in Object.keys(args)) {
            const key = Object.keys(args)[i];
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    parent = null;
                    value = request.query[name];
                    break;
                case 'path':
                    parent = null;
                    value = request.params[name];
                    break;
                case 'header':
                    parent = null;
                    value = request.header[name];
                    break;
                case 'body':
                    parent = name + '.';
                    value = request.body;
                    break;
                case 'body-prop':
                    parent = 'body.';
                    value = request.body[name];
                    break;
                default:
                    values.push(null);
                    continue;
            }
            const okRequired = ParameterValidator.validateRequired(name, value, args[key].dataType, args[key].required, validationErrors);
            const okInt = ParameterValidator.validateIntParameters(name, value, args[key].dataType, args[key].validators, validationService, validationErrors);
            const okAddress = await ParameterValidator.validateAdressParameters(name, value, args[key].dataType, addressParameters, validationService, validationErrors);
            if (!okRequired || !okInt || !okAddress) {
                values.push(null);
                continue;
            }
            values.push(ValidateParam(args[key], value, models, name, fieldErrors, parent));
        }

        if (validationErrors.length > 0) {
            const exception = new ParameterException();
            exception.code = ErrorCode.ValidationFailed;
            exception.message = "Invalid parameters";
            exception.name = "Invalid parameters";
            exception.validationErrors = validationErrors;
            throw exception;
        }

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
