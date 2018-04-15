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

    private fieldErrors: ValidationErrorModel[] = [];

    constructor(
        private validationService: ValidationService,
    ) {
    }

    public addPageParameters(page: number, perPage: number): void {
        if (page && page < 1) {
            this.fieldErrors.push({
                code: ValidationErrorCode.ValueOutOfRange,
                reason: "The parameter page must be greather than 1",
                field: "page",
            });
        }
        if (perPage && (perPage < 1 || perPage > 100)) {
            this.fieldErrors.push({
                code: ValidationErrorCode.ValueOutOfRange,
                reason: "The parameter perPage must be greather than 1 and lesser than or equal to 100",
                field: "perPage",
            });
        }
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
