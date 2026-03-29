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
        CREATE TABLE IF NOT EXISTS gardens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          rows INTEGER NOT NULL,
          cols INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS garden_cells (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          garden_id INTEGER NOT NULL,
          row INTEGER NOT NULL,
          col INTEGER NOT NULL,
          plant_id INTEGER NOT NULL,
          FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE,
          FOREIGN KEY (plant_id) REFERENCES plants(id),
          UNIQUE (garden_id, row, col)
        );
      `);

    logger.info("Garden database initialized.");
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
