import { Context } from "https://deno.land/x/oak@v17.0.0/mod.ts";
import { getSession, updateSession } from "../repositories/authRepository.ts";
import { getCookies } from "https://deno.land/std/http/cookie.ts";
import logger from "../utils/logger.ts";
import { AuthHeaders } from "../models/models.ts";

const sessionMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
    const sessionId: string = getCookies(ctx.request.headers)[AuthHeaders.SESSION_ID];
    if (!sessionId) {
        logger.info('Headers did not have session id')
        ctx.response.status = 403
        ctx.response.body = { status: 403, message: "Please log in" }
        return
    } else {
        try {
            ctx.state.session = await getSession(sessionId);
        } catch (err) {
            logger.info(`Error when looking for session: ${sessionId}, Message: ${err?.message}`)
            ctx.response.status = 403
            ctx.response.body = { status: 403, message: "Please log in" }
            return
        }
    }
    if (!ctx.state.session) {
        logger.info('No session data: ', ctx.state.session)
        ctx.response.status = 403
        ctx.response.body = { status: 403, message: "Please log in" }
        return
    }
    logger.info("session data: ", ctx.state.session)

    await next();

    if (sessionId) {
        await updateSession(sessionId);
    }
};

export default sessionMiddleware;