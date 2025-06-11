import { Router } from "https://deno.land/x/oak/mod.ts";
import { User, UserLoginInterface } from "../models/models.ts";
import { login, createUser, createAndGetSessionID, logout } from "../controllers/authController.ts";
import { getCookies } from "https://deno.land/std/http/cookie.ts";
import logger from "../utils/logger.ts";
import { AuthHeaders } from "../models/models.ts";

const authRouter = new Router({ prefix: "/api/auth" });

authRouter
    .post("/register", async (context) => {
        const { firstName, lastName, email, password, phoneNumber } = await context.request.body.json()
        if (!firstName || !lastName || !email || !password) {
            context.response.status = 400;
            context.response.body = { message: "Invalid input" };
            return;
        }
        try {
            const userId = await createUser({ firstName, lastName, email, password, phoneNumber } as User)
            context.response.body = { id: userId };
        } catch (err) {
            context.response.status = 500;
            context.response.body = { message: err?.message }
        }
    })
    .post('/login', async (context) => {
        const { email, password }: User = await context.request.body.json()
        if (!email || !password) {
            context.response.status = 400;
            context.response.body = { message: "Invalid input" };
            return;
        }
        try {
            const user = await login({ email, password } as UserLoginInterface)
            if (user) {
                const sessionId = await createAndGetSessionID(user as User)
                context.response.headers.set("Set-Cookie", `${AuthHeaders.SESSION_ID}=${sessionId}; HttpOnly`);
                context.response.body = { message: "Login success" }
                return
            } else {
                context.response.body = { message: "Login failed" }
                context.response.status = 403
                return
            }
        } catch (err) {
            logger.error(err)
            context.response.body = { message: "Login failed" }
            context.response.status = 500
        }
    })
    .post('/logout', async (context) => {
        const sessionId: string = getCookies(context.request.headers)[AuthHeaders.SESSION_ID];
        await logout(sessionId)
        context.state.session = {}
        context.cookies.set(sessionId, "")
        context.response.body = { message: "Logout successful" }
    })

export default authRouter;
