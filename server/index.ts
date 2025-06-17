import express from 'express';
// import logger from "./utils/logger";
import requestLogger from "./middleware/requestLogger";
import requestIdMiddleware from "./middleware/requestId";

// import stripeRouter from "./routes/stripeRoutes";
// import userRouter from "./routes/userRoutes";
// import authRouter from "./routes/authRoutes";

import plantRouter from "./routes/plantRoutes";
// import zoneRouter from "./routes/zoneRoutes";

const app = express();
const PORT = 8000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Uncomment these if you want to use request logging and request ID middleware
// app.use(requestIdMiddleware);
// app.use(requestLogger);

// Plant routes
app.use("/api/plants", plantRouter);

// Zone routes (if needed in the future)
// app.use("/api/zones", zoneRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});