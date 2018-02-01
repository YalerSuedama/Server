import {SchemaValidator, ValidatorResult, schemas} from "@0xproject/json-schemas";
import { injectable } from "inversify";
import { ValidationService } from "../../app";

@injectable()
export class ZeroExSchemaBasedValidationService implements ValidationService {

    private validator = new SchemaValidator();

    public isAddress(address: string): boolean {
        const validatorResult: ValidatorResult = this.validator.validate(address, schemas.addressSchema);
        return validatorResult.valid;
    }
}
