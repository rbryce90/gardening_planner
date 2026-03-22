import logger from "../utils/logger.ts";
import { Request, Response, NextFunction } from "express";
import "../types/express.d.ts";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    logger.info(
        `${start} Request: ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)} [RequestId]: ${req?.requestId || "N/A"}`,
    );

    next();

    const ms = Date.now() - start;
    logger.info(
        `${Date.now()} Response: ${req.method} ${req.url} - Status: ${res.statusCode} - Time: ${ms}ms [RequestId]: ${req?.requestId || "N/A"}`,
    );
};

export default requestLogger;
