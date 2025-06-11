import Logger from "https://deno.land/x/logger@v1.1.6/logger.ts";

const logger = new Logger()

await logger.initFileLogger("./log");

export default logger 
