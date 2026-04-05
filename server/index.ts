import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import logger from "./utils/logger.ts";
import requestLogger from "./middleware/requestLogger.ts";
import requestIdMiddleware from "./middleware/requestId.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { RegisterRoutes } from "./generated/routes.ts";
import { getDriver, closeDriver } from "./databases/neo4jDb.ts";
import { runMigrations } from "./databases/migrate.ts";

const app = express();
const PORT = 8000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);

// Rate limit auth routes
app.use("/v1/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// Swagger docs
if (process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const swaggerDocument = require("./generated/swagger.json");
    app.use("/v1/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch {
    logger.warn("Swagger spec not found — run 'npm run generate' to create it");
  }
}

// Run database migrations
runMigrations();

// TSOA generated routes
RegisterRoutes(app);

app.use(errorHandler);

// Initialize Neo4j connection
try {
  getDriver();
  logger.info("Neo4j connection established");
} catch (error) {
  logger.warn("Neo4j connection failed — graph features will be unavailable", { error });
}

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down...");
  await closeDriver();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
