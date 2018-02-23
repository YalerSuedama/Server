import { inject, injectable, named } from "inversify";
import { FeeService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models";

@injectable()
export class FromZeroExTickerService implements TickerService {

    constructor( @inject(TYPES.TickerService) @named("Repository") private fromCacheTickerService: TickerService, @inject(TYPES.FeeService) private zeroExFeeService: FeeService) { }

    public async getTicker(from: Token, to: Token): Promise<Ticker> {
        const ticker = await this.fromCacheTickerService.getTicker(from, to);
        if (from.symbol === "ZRX") {
            ticker.price =  ticker.price.plus(await this.zeroExFeeService.getTakerFee(from));
        }
        return ticker;
    }
}
