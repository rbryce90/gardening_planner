import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError.ts";
import logger from "../utils/logger.ts";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof HttpError ? err.status : 500;
  logger.error(err.message, { stack: err.stack });
  const message = err instanceof HttpError ? err.message : "Internal server error";
  res.status(status).json({ message });
}
