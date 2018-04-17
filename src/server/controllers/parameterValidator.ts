import { TYPES, ValidationService } from "src/app";
import { ParameterException } from "../../domain/exception";
import { ErrorCode, ValidationErrorCode, ValidationErrorModel } from "../middleware/errorHandler";

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

    public static validateAdressParameters(name: string, value: any, type: string, addressParameters: string[], validationService: ValidationService, fieldErrors: ValidationErrorModel[]): boolean {
        if (validationService && addressParameters.find((parameter) => parameter === name)) {
            if (value !== undefined && value !== null && value !== "" && !validationService.isAddress(value)) {
                fieldErrors.push({
                    code: ValidationErrorCode.InvalidAddress,
                    reason: `The parameter ${name} is not a valid address`,
                    field: name,
                });
                return false;
            }
        }
        return true;
    }

    public static validateIntParameters(name: string, value: any, type: string, validators: any, validationService: ValidationService, fieldErrors: ValidationErrorModel[]): boolean {
        if (validationService && type === "integer" && value !== undefined && value !== null && value !== "") {
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

    private fieldErrors: ValidationErrorModel[] = [];

    constructor(
        private validationService: ValidationService,
    ) {
    }

    public async addExchangeAddress(exchangeContractAddress: string): Promise<void> {
        if (!await this.validationService.validateCurrentContractAddress(exchangeContractAddress)) {
            this.fieldErrors.push({
                code: ValidationErrorCode.AddressNotSupported,
                reason: "Invalid exchange contract address",
                field: "exchangeContractAddress",
            });
        }
    }

    public validate() {
        if (this.fieldErrors.length > 0) {
            const exception = new ParameterException();
            exception.code = ErrorCode.ValidationFailed;
            exception.message = "Invalid parameters";
            exception.name = "Invalid parameters";
            exception.validationErrors = this.fieldErrors;
            throw exception;
        }
    }
}
