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
        CREATE TABLE IF NOT EXISTS plants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          category TEXT,
          growth_form TEXT,
          edible_part TEXT,
          family TEXT
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS plant_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          scientific_name TEXT,
          description TEXT,
          planting_notes TEXT,
          FOREIGN KEY (plant_id) REFERENCES plants(id)
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS companions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          companion_id INTEGER NOT NULL,
          FOREIGN KEY (plant_id) REFERENCES plants(id),
          FOREIGN KEY (companion_id) REFERENCES plants(id)
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS antagonists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          antagonist_id INTEGER NOT NULL,
          FOREIGN KEY (plant_id) REFERENCES plants(id),
          FOREIGN KEY (antagonist_id) REFERENCES plants(id)
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS zones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          min_temperature INTEGER,
          max_temperature INTEGER
        );
      `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS planting_seasons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_type_id INTEGER NOT NULL,
          zone_id INTEGER NOT NULL,
          start_month TEXT NOT NULL,
          end_month TEXT NOT NULL,
          method TEXT,
          notes TEXT,
          FOREIGN KEY (plant_type_id) REFERENCES plant_types(id),
          FOREIGN KEY (zone_id) REFERENCES zones(id)
        );
      `);

    logger.info("Database initialized successfully.");
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
