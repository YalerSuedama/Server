import { Ticker } from "../models";
import { TickerService } from "./tickerService";

export interface TickerRepository extends TickerService {
    addTicker(ticker: Ticker): Promise<void>;
}
