import { Ticker, Token } from "../models";

export interface TickerService {
    getTicker(tokenFrom: Token, tokenTo: Token): Promise<Ticker>;
}
