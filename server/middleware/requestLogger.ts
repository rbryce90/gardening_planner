/// <reference path="../types/express.d.ts" />
import logger from "../utils/logger.ts";
import { Request, Response, NextFunction } from "express";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const safeHeaders = {
    contentType: req.headers["content-type"],
    userAgent: req.headers["user-agent"],
  };
  logger.info(
    `Request: ${req.method} ${req.url} - Headers: ${JSON.stringify(safeHeaders)} [RequestId]: ${req?.requestId || "N/A"}`,
  );

  res.on("finish", () => {
    const ms = Date.now() - start;
    logger.info(
      `Response: ${req.method} ${req.url} - Status: ${res.statusCode} - Time: ${ms}ms [RequestId]: ${req?.requestId || "N/A"}`,
    );
  });

  next();
};

export default requestLogger;
