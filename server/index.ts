import express from "express";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.ts";
import requestLogger from "./middleware/requestLogger.ts";
import requestIdMiddleware from "./middleware/requestId.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import plantRouter from "./routes/plantRoutes.ts";
import authRouter from "./routes/authRoutes.ts";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);

app.use("/api/plants", plantRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});
