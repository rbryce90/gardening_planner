// logger.ts
const getTimestamp = () => new Date().toISOString();

const logger = {
    info: (...args: unknown[]) => {
        console.log(`[INFO] ${getTimestamp()} -`, ...args);
    },
    warn: (...args: unknown[]) => {
        console.warn(`[WARN] ${getTimestamp()} -`, ...args);
    },
    error: (...args: unknown[]) => {
        console.error(`[ERROR] ${getTimestamp()} -`, ...args);
    },
    debug: (...args: unknown[]) => {
        if (process.env.DEBUG === "true") {
            console.debug(`[DEBUG] ${getTimestamp()} -`, ...args);
        }
    },
};

export default logger;
