import { Router } from "https://deno.land/x/oak/mod.ts";
import { getUsers } from "../controllers/userController.ts";
import sessionMiddleware from "../middleware/session.ts";

const userRouter = new Router();
userRouter.use(sessionMiddleware)

userRouter
    .get("/api/users", async (context) => {
        const users = await getUsers()
        context.response.status = 200;
        context.response.body = users
    })

export default userRouter;
