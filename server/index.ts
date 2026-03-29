import express from "express";
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
import { getDatabase as getPlantDatabase } from "./databases/plantDb.ts";

// Validate required env vars
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === "dev-secret-change-in-production") {
  logger.error("JWT_SECRET must be set and not the default value");
  process.exit(1);
}

const app = express();
const PORT = 8000;

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/v1/api/auth", authLimiter);

// Swagger docs
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swaggerDocument = require("./generated/swagger.json");
  app.use("/v1/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  logger.warn("Swagger spec not found — run 'npm run generate' to create it");
}

// TSOA generated routes
RegisterRoutes(app);

app.use(errorHandler);

// Health check
app.get("/health", async (_req, res) => {
  let sqliteOk = false;
  let neo4jOk = false;

  try {
    const db = getPlantDatabase();
    db.prepare("SELECT 1").get();
    sqliteOk = true;
  } catch {
    // sqlite unavailable
  }

  try {
    const driver = getDriver();
    const session = driver.session();
    await session.run("RETURN 1");
    await session.close();
    neo4jOk = true;
  } catch {
    // neo4j unavailable
  }

  const status = sqliteOk && neo4jOk ? "ok" : "degraded";
  const statusCode = sqliteOk ? 200 : 503;
  res.status(statusCode).json({ status, sqlite: sqliteOk, neo4j: neo4jOk });
});

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

// Keep Deno process alive — Express via npm doesn't hold the event loop open
setInterval(() => {}, 1 << 30);
