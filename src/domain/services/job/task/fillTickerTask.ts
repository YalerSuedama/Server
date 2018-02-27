import * as config from "config";
import { inject, injectable, named } from "inversify";
import * as moment from "moment";
import { JobTask, TickerRepository, TickerService, TokenService, TYPES } from "../../../../app";

@injectable()
export class FillTickerTask implements JobTask {

    public constructor(
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.UrlTickerService) @named("Relayer") private tickerService: TickerService,
        @inject(TYPES.TickerRepository) private cachedTickers: TickerRepository,
    ) {
    }

    public getName(): string {
        return "Fill ticker";
    }

    public getInterval(): moment.Duration {
        return moment.duration(5, "minutes");
    }

    public async doTask(): Promise<void> {
        const availableTokens = await this.tokenService.listAllTokens();
        for (const from of availableTokens) {
            for (const to of availableTokens.filter((token) => token.symbol !== from.symbol)) {
                const ticker = await this.tickerService.getTicker(from, to);
                if (ticker) {
                    await this.cachedTickers.addTicker(ticker);
                }
            }
        }
    }
}
