import { Context } from "https://deno.land/x/oak@v17.0.0/mod.ts";
import logger from "../utils/logger.ts";

const requestLogger = async (ctx: Context, next: () => Promise<unknown>) => {
    const { method, url, headers } = ctx.request;
    const start = Date.now();

    logger.info(`Request: ${method} ${url} - Headers: ${JSON.stringify([...headers])} [RequestId]: ${ctx.state.requestId}`);
    if (ctx.request.hasBody) {
        try {
            const body = await ctx.request?.body.json();
            logger.info(`Request Body: ${JSON.stringify(body)} [RequestId]: ${ctx.state.requestId}`);
        } catch (err) {
            logger.info(err)
        }
    }

    await next();

    const ms = Date.now() - start;
    logger.info(`Response: ${ctx.response.status} - ${method} ${url} - ${ms}ms [RequestId]: ${ctx.state.requestId}`);
};

export default requestLogger