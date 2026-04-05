import { DatabaseSync } from "node:sqlite";
import { getDb } from "./db.ts";
import logger from "../utils/logger.ts";

const initializeDatabase = (): DatabaseSync => {
  const db = getDb();

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
          FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
        );
      `);

  db.exec(`
        CREATE TABLE IF NOT EXISTS companions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          companion_id INTEGER NOT NULL,
          FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
          FOREIGN KEY (companion_id) REFERENCES plants(id) ON DELETE CASCADE
        );
      `);

  db.exec(`
        CREATE TABLE IF NOT EXISTS antagonists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          antagonist_id INTEGER NOT NULL,
          FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
          FOREIGN KEY (antagonist_id) REFERENCES plants(id) ON DELETE CASCADE
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
          FOREIGN KEY (plant_type_id) REFERENCES plant_types(id) ON DELETE CASCADE,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
          UNIQUE(plant_type_id, zone_id),
          CHECK(start_month IN ('January','February','March','April','May','June','July','August','September','October','November','December')),
          CHECK(end_month IN ('January','February','March','April','May','June','July','August','September','October','November','December'))
        );
      `);

  // Indexes for foreign keys
  db.exec("CREATE INDEX IF NOT EXISTS idx_plant_types_plant_id ON plant_types(plant_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_companions_plant_id ON companions(plant_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_companions_companion_id ON companions(companion_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_antagonists_plant_id ON antagonists(plant_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_antagonists_antagonist_id ON antagonists(antagonist_id)");
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_planting_seasons_plant_type_id ON planting_seasons(plant_type_id)",
  );
  db.exec("CREATE INDEX IF NOT EXISTS idx_planting_seasons_zone_id ON planting_seasons(zone_id)");

  // Unique constraints for pair ordering
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_companions_unique ON companions(plant_id, companion_id)",
  );
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_antagonists_unique ON antagonists(plant_id, antagonist_id)",
  );

  logger.info("Database initialized successfully.");
  return db;
};

export function getDatabase(): DatabaseSync {
  return getDb();
}

export default initializeDatabase;
