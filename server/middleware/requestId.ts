import { Context } from "https://deno.land/x/oak/mod.ts";
import { generate } from "https://deno.land/std@0.62.0/uuid/v4.ts";

const requestIdMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
    const requestId = generate();
    ctx.state.requestId = requestId;
    await next();
};

export default requestIdMiddleware;