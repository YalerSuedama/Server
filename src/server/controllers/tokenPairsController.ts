import { inject, injectable } from "inversify";
import { Controller, Get, Query, Route } from "tsoa";
import { TokenPairsService, TYPES } from "../../app";
import { TokenPairTradeInfo } from "../../app/models";

@Route("token_pairs")
@injectable()
export class TokenPairsController extends Controller {

    constructor( @inject(TYPES.TokenPairsService) private tokenPairsService: TokenPairsService) {
        super();
    }

    @Get()
    public async listPairs( @Query() tokenA?: string, @Query() tokenB?: string): Promise<TokenPairTradeInfo[]> {
        return this.tokenPairsService.listPairs(tokenA, tokenB);
    }
}
