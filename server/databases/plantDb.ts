import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("plants.db");

// Enable foreign keys
db.query(`PRAGMA foreign_keys = ON;`);

// Create plants table
db.query(`
  CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK(category IN ('vegetable', 'fruit', 'herb', 'nut', 'grain')),
    growth_form TEXT NOT NULL CHECK(growth_form IN ('tree', 'vine', 'bush', 'shrub', 'herbaceous', 'groundcover', 'root', 'underground')),
    edible_part TEXT
  );
`);

// Create plant_types table
db.query(`
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

// Create companions table (many-to-many between plant_types)
db.query(`
  CREATE TABLE IF NOT EXISTS companions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_type_id INTEGER NOT NULL,
    companion_id INTEGER NOT NULL,
    FOREIGN KEY (plant_type_id) REFERENCES plant_types(id),
    FOREIGN KEY (companion_id) REFERENCES plant_types(id)
  );
`);

// Create antagonists table (many-to-many between plant_types)
db.query(`
  CREATE TABLE IF NOT EXISTS antagonists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_type_id INTEGER NOT NULL,
    antagonist_id INTEGER NOT NULL,
    FOREIGN KEY (plant_type_id) REFERENCES plant_types(id),
    FOREIGN KEY (antagonist_id) REFERENCES plant_types(id)
  );
`);

// Create zones table
db.query(`
  CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    min_temperature INTEGER,
    max_temperature INTEGER
  );
`);

// Create planting_seasons table linking plant_types and zones
db.query(`
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

export default db;
