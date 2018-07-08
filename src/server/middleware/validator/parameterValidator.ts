import { TYPES, ValidationService } from "src/app";
import { ParameterException } from "../../../domain/exception";
import { ErrorCode, ValidationErrorCode, ValidationErrorModel } from "../../middleware/errorHandler";
import { ValidationAddressParam } from "./validationAddressParam";
import { ValidationAddressType } from "./validationAddressType";

export class ParameterValidator {

    public static validateRequired(name: string, value: any, type: string, required: boolean, fieldErrors: ValidationErrorModel[]): boolean {
        if (required && (value === undefined || value === null || (type === "string" && value === ""))) {
            fieldErrors.push({
                code: ValidationErrorCode.RequiredField,
                field: name,
                reason: `The parameter ${name} is required`,
            });
            return false;
        }
        return true;
    }

    public static async validateAdressParameters(name: string, value: any, type: string, addressParameters: ValidationAddressParam[], validationService: ValidationService, fieldErrors: ValidationErrorModel[]): Promise<boolean> {
        const addressParameter = addressParameters.find((parameter) => parameter.param === name);
        if (validationService && value !== undefined && value !== null && value !== "") {
            if (addressParameter) {
                if (!validationService.isAddress(value)) {
                    fieldErrors.push({
                        code: ValidationErrorCode.InvalidAddress,
                        field: name,
                        reason: `The parameter ${name} is not a valid address`,
                    });
                    return false;
                }

                switch (addressParameter.type) {
                    case ValidationAddressType.EXCHANGE_CONTRACT:
                        if (!await validationService.validateCurrentContractAddress(value)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                field: name,
                                reason: "Invalid exchange contract address",
                            });
                            return false;
                        }
                        break;
                    case ValidationAddressType.RELAYER:
                        if (!await validationService.validateMainAddress(value, false)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                field: name,
                                reason: `Invalid ${name} address`,
                            });
                            return false;
                        }
                        break;
                    case ValidationAddressType.RELAYER_OR_ZERO:
                        if (!await validationService.validateMainAddress(value, true)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                field: name,
                                reason: `Invalid ${name} address`,
                            });
                            return false;
                        }
                        break;
                    case ValidationAddressType.WHITELISTED_ADDRESS:
                        if (!await validationService.isWhitelistedAddress(value)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                field: name,
                                reason: `Invalid ${name} address. Only whitelisted addresses can be used`,
                            });
                            return false;
                        }
                        break;
                    default:
                        break;
                }
            }
        } else if (addressParameter && addressParameter.type === ValidationAddressType.WHITELISTED_ADDRESS) {
            if (!await validationService.isWhitelistedAddress(value)) {
                fieldErrors.push({
                    code: ValidationErrorCode.AddressNotSupported,
                    field: name,
                    reason: `Invalid ${name} address. Only whitelisted addresses can be used`,
                });
                return false;
            }
        }
        return true;
    }

    public static validateIntParameters(name: string, value: any, type: string, validators: any, validationService: ValidationService, fieldErrors: ValidationErrorModel[]): boolean {
        if (validationService && (type === "integer" || (validators && validators.isInt && (validators.isInt.errorMsg === name))) && value !== undefined && value !== null && value !== "") {
            const int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
            if (!int.test(value + "")) {
                fieldErrors.push({
                    code: ValidationErrorCode.IncorrectFormat,
                    field: name,
                    reason: `The parameter ${name} is not a valid integer`,
                });
                return false;
            }
            if (validators && validators.minimum && validators.minimum.value && parseInt(value, 10) < validators.minimum.value) {
                fieldErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: name,
                    reason: `The parameter ${name} must be greather than or equal to ${validators.minimum.value}`,
                });
                return false;
            }
            if (validators && validators.maximum && validators.maximum.value && parseInt(value, 10) > validators.maximum.value) {
                fieldErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    field: name,
                    reason: `The parameter ${name} must be lesser than or equal to ${validators.maximum.value}`,
                });
                return false;
            }
        }
        return true;
    }
}
