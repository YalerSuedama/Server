/* tslint:disable */
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../iocContainer';
import { OrderController } from './../../controllers/orderController';
import { TokenPairsController } from './../../controllers/tokenPairsController';
import { FeeController } from './../../controllers/feeController';

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
            "ecSignature": { "ref": "ECSignature", "required": true },
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
        },
    },
    "ErrorModel": {
        "properties": {
            "message": { "dataType": "string", "required": true },
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
                page: { "in": "query", "name": "page", "dataType": "double" },
                perPage: { "in": "query", "name": "per_page", "dataType": "double" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<OrderController>(OrderController);


            const promise = controller.listOrders.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/api/v0/token_pairs',
        function(request: any, response: any, next: any) {
            const args = {
                tokenA: { "in": "query", "name": "tokenA", "dataType": "string" },
                tokenB: { "in": "query", "name": "tokenB", "dataType": "string" },
                page: { "in": "query", "name": "page", "dataType": "double" },
                perPage: { "in": "query", "name": "per_page", "dataType": "double" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TokenPairsController>(TokenPairsController);


            const promise = controller.listPairs.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/api/v0/fees',
        function(request: any, response: any, next: any) {
            const args = {
                exchangeContractAddress: { "in": "body-prop", "name": "exchangeContractAddress", "required": true, "dataType": "string" },
                makerTokenAddress: { "in": "body-prop", "name": "makerTokenAddress", "required": true, "dataType": "string" },
                takerTokenAddress: { "in": "body-prop", "name": "takerTokenAddress", "required": true, "dataType": "string" },
                maker: { "in": "body-prop", "name": "maker", "required": true, "dataType": "string" },
                taker: { "in": "body-prop", "name": "taker", "required": true, "dataType": "string" },
                makerTokenAmount: { "in": "body-prop", "name": "makerTokenAmount", "required": false, "dataType": "string" },
                takerTokenAmount: { "in": "body-prop", "name": "takerTokenAmount", "required": false, "dataType": "string" },
                expirationUnixTimestampSec: { "in": "body-prop", "name": "expirationUnixTimestampSec", "required": true, "dataType": "string" },
                salt: { "in": "body-prop", "name": "salt", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<FeeController>(FeeController);


            const promise = controller.calculateFee.apply(controller, validatedArgs);
            promiseHandler(controller, promise, response, next);
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

    function getValidatedArgs(args: any, request: any): any[] {
        const fieldErrors: FieldErrors = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return ValidateParam(args[key], request.query[name], models, name, fieldErrors);
                case 'path':
                    return ValidateParam(args[key], request.params[name], models, name, fieldErrors);
                case 'header':
                    return ValidateParam(args[key], request.header(name), models, name, fieldErrors);
                case 'body':
                    return ValidateParam(args[key], request.body, models, name, fieldErrors, name + '.');
                case 'body-prop':
                    return ValidateParam(args[key], request.body[name], models, name, fieldErrors, 'body.');
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
