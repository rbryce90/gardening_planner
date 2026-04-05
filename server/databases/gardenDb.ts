import { DatabaseSync } from "node:sqlite";
import { getDb } from "./db.ts";
import logger from "../utils/logger.ts";

const initializeDatabase = (): DatabaseSync => {
  const db = getDb();

  db.exec(`
        CREATE TABLE IF NOT EXISTS gardens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          rows INTEGER NOT NULL,
          cols INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

  // Indexes for foreign keys
  db.exec("CREATE INDEX IF NOT EXISTS idx_gardens_user_id ON gardens(user_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_garden_cells_garden_id ON garden_cells(garden_id)");

  logger.info("Garden database initialized.");
  return db;
};

export function getDatabase(): DatabaseSync {
  return getDb();
}

export default initializeDatabase;
