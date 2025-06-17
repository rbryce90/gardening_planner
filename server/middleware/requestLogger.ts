import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import './types/express'; // Import the custom type declaration

const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    logger.info(
        `${start} Request: ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)} [RequestId]: ${req?.requestId || 'N/A'}`,
    );

    await next();

    const ms = Date.now() - start;
    logger.info(
        `${Date.now()} Response: ${req.method} ${req.url} - Status: ${res.statusCode} - Time: ${ms}ms [RequestId]: ${req?.requestId || 'N/A'}`,
    );

    // logger.info(
    //     `Response: ${ctx.request.method} ${ctx.request.url} - Headers: ${JSON.stringify([...ctx.request.headers])} [RequestId]: ${ctx.state.requestId}`,
    // );
};

export default requestLogger;
