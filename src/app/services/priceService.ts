import { Price } from "../models";

export interface PriceService {
    calculatePrice(tokenFrom: string, tokenTo: string, trader: string): Promise<Price>;
}