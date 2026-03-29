import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const status: number = (err as unknown as Record<string, unknown>).status as number ?? 500;
    logger.error(err.message, { stack: err.stack });
    res.status(status).json({ message: err.message || "Internal server error" });
}
