import { DatabaseSync } from "node:sqlite";
import logger from "../utils/logger.ts";

let dbInstance: DatabaseSync | null = null;

const initializeDatabase = (): DatabaseSync => {
    if (dbInstance) {
        return dbInstance;
    }

    const db = new DatabaseSync("plants.db");

    db.exec("PRAGMA foreign_keys = ON;");

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

    try {
        db.exec("ALTER TABLE users ADD COLUMN zone_id INTEGER REFERENCES zones(id)");
    } catch {
        // column already exists — safe to ignore
    }

    logger.info("User database initialized.");
    dbInstance = db;
    return db;
};

export function getDatabase(): DatabaseSync {
    if (!dbInstance) {
        initializeDatabase();
    }
    return dbInstance!;
}

export default initializeDatabase;
