import { TickerService } from "./tickerService";

export interface UrlTickerService extends TickerService {
    setUrl(url: string): Promise<void>;
}
