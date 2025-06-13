import { Router } from "https://deno.land/x/oak/mod.ts";
import { getBalance } from '../controllers/stripeController.ts'
const stripeRouter = new Router({ prefix: "/api/stripe" });


// w - i - p 
stripeRouter
    .get("/", async (context) => {
        try {
            context.response.body = await getBalance()
            context.response.status = 200;
        } catch (err) {
            context.response.body = err
            context.response.status = 500
        }
    })

export default stripeRouter;
