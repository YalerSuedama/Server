import { Request, Response } from "express";
import { RequestLimitService, TYPES } from "../../../app";
import { iocContainer } from "../iocContainer";

const asyncMiddleware = (fn: (req: Request, res: Response, next: any) => any) => {
    return (req: Request, res: Response, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncMiddleware(async (req: Request, res: Response, next: () => any) => {
    const requestLimit = await iocContainer.get<RequestLimitService>(TYPES.RequestLimitService).getLimit(req.ip);
    if (requestLimit.isLimitReached) {
        res.sendStatus(429).end();
    } else {
        res.set({
            "X-RateLimit-Limit": requestLimit.limitPerHour,
            "X-RateLimit-Remaining": requestLimit.remainingLimit,
            "X-RateLimit-Reset": requestLimit.currentLimitExpiration,
        });
    }
    next();
});
