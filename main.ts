import { Application } from "https://deno.land/x/oak/mod.ts";
// import userRouter from "./routes/userRoutes.ts";
// import authRouter from "./routes/authRoutes.ts";
import logger from "./utils/logger.ts";
import requestLogger from "./middleware/requestLogger.ts";
import requestIdMiddleware from "./middleware/requestId.ts";
// import stripeRouter from "./routes/stripeRoutes.ts";

const app = new Application();

app.use(requestIdMiddleware)
app.use(requestLogger)
// create a hello world on route 
app.use((ctx) => {
    ctx.response.body = "TODO: Make the Webapp here";
});

// Auth routes
// app.use(authRouter.routes());
// app.use(authRouter.allowedMethods());

// Stripe routes
// app.use(stripeRouter.routes())
// app.use(stripeRouter.allowedMethods())

// User routes
// app.use(userRouter.routes());
// app.use(userRouter.allowedMethods());

// Start the server
logger.info("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
