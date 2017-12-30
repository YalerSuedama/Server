import { inject, injectable } from "inversify";
import * as _ from "lodash";
import "reflect-metadata";
import { LoggerService, TYPES } from "../index";

@injectable()
export class PaginationService {
    constructor( @inject(TYPES.LoggerService) private logger: LoggerService) {
        this.logger.setNamespace("paginationservice");
    }

    public async paginate<T>(list: T[], page?: number, perPage?: number): Promise<T[]> {
        if (!list) {
            throw new Error("Cannot paginate an unexisting list.");
        }

        if (!page) {
            this.logger.log("Setting default page to 1.");
            page = 1;
        }
        if (!perPage) {
            this.logger.log("Setting default items per page to the list size.");
            perPage = list.length;
        }

        if (page < 1) {
            throw new RangeError("Page should start at 1.");
        }
        if (perPage < 1) {
            throw new RangeError("The number of itens per page must be greater than or equal to 1.");
        }

        return _.take(_.drop(list, (page - 1) * perPage), perPage);
    }
}
