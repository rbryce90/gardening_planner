import { DatabaseSync } from "node:sqlite";
import { getDb } from "./db.ts";
import logger from "../utils/logger.ts";

const initializeDatabase = (): DatabaseSync => {
  const db = getDb();

  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);

  logger.info("User database initialized.");
  return db;
};

export function getDatabase(): DatabaseSync {
  return getDb();
}

export default initializeDatabase;
