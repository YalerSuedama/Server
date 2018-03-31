import { inject, injectable, named } from "inversify";
import { FeeService, TickerService, TYPES } from "../../../app";
import { Ticker, Token } from "../../../app/models";

@injectable()
export class FromZeroExTickerService implements TickerService {

    constructor( @inject(TYPES.TickerService) @named("Repository") private fromCacheTickerService: TickerService, @inject(TYPES.FeeService) @named("ConstantReserveManager") private feeService: FeeService) { }

    public async getTicker(from: Token, to: Token): Promise<Ticker> {
        const ticker = await this.fromCacheTickerService.getTicker(from, to);

        const newTicker: Ticker = {
            from: ticker.from,
            price: ticker.price,
            to: ticker.to,
        };

        if (from.symbol === "ZRX") {
            newTicker.price =  ticker.price.plus(await this.feeService.getTakerFee(to, ticker.price));
        }
        return newTicker;
    }
}
