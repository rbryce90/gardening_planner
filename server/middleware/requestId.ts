import uuid from "uuid";
import { Request, Response, NextFunction } from "express";

const requestIdMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuid.v4();
    req.requestId = requestId;
    await next();
};

export default requestIdMiddleware;