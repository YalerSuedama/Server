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
                reason: `The parameter ${name} is required`,
                field: name,
            });
            return false;
        }
        return true;
    }

    public static async validateAdressParameters(name: string, value: any, type: string, addressParameters: ValidationAddressParam[], validationService: ValidationService, fieldErrors: ValidationErrorModel[]): Promise<boolean> {
        if (validationService && value !== undefined && value !== null && value !== "") {
            const addressParameter = addressParameters.find((parameter) => parameter.param === name);
            if (addressParameter) {
                if (!validationService.isAddress(value)) {
                    fieldErrors.push({
                        code: ValidationErrorCode.InvalidAddress,
                        reason: `The parameter ${name} is not a valid address`,
                        field: name,
                    });
                    return false;
                }

                switch (addressParameter.type) {
                    case ValidationAddressType.EXCHANGE_CONTRACT:
                        if (!await validationService.validateCurrentContractAddress(value)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                reason: "Invalid exchange contract address",
                                field: name,
                            });
                            return false;
                        }
                        break;
                    case ValidationAddressType.RELAYER:
                        if (!await validationService.validateMainAddress(value, false)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                reason: `Invalid ${name} address`,
                                field: name,
                            });
                            return false;
                        }
                        break;
                    case ValidationAddressType.RELAYER_OR_ZERO:
                        if (!await validationService.validateMainAddress(value, true)) {
                            fieldErrors.push({
                                code: ValidationErrorCode.AddressNotSupported,
                                reason: `Invalid ${name} address`,
                                field: name,
                            });
                            return false;
                        }
                        break;
                    default:
                        break;
                }
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
                    reason: `The parameter ${name} is not a valid integer`,
                    field: name,
                });
                return false;
            }
            if (validators && validators.minimum && validators.minimum.value && parseInt(value, 10) < validators.minimum.value) {
                fieldErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    reason: `The parameter ${name} must be greather than or equal to ${validators.minimum.value}`,
                    field: name,
                });
                return false;
            }
            if (validators && validators.maximum && validators.maximum.value && parseInt(value, 10) > validators.maximum.value) {
                fieldErrors.push({
                    code: ValidationErrorCode.ValueOutOfRange,
                    reason: `The parameter ${name} must be lesser than or equal to ${validators.maximum.value}`,
                    field: name,
                });
                return false;
            }
        }
        return true;
    }
}
