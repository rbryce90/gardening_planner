import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

const requestIdMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  next();
};

export default requestIdMiddleware;
