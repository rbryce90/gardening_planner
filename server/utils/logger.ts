import winston from "winston";

const logger = winston.createLogger({
    level: Deno.env.get("DEBUG") === "true" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
