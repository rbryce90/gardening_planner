import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let dbInstance: Database | null = null;

// Initialize the database connection
const initializeDatabase = async (): Promise<Database> => {
  if (dbInstance) {
    return dbInstance; // Return the existing instance if already initialized
  }

  const db = await open({
    filename: "plants.db",
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec(`PRAGMA foreign_keys = ON;`);

  // Create plants table
  await db.exec(`
      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        growth_form TEXT,
        edible_part TEXT,
        family TEXT
      );
    `);

  // Create plant_types table
  await db.exec(`
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

  // Create companions table (many-to-many between plants)
  await db.exec(`
      CREATE TABLE IF NOT EXISTS companions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER NOT NULL,
        companion_id INTEGER NOT NULL,
        FOREIGN KEY (plant_id) REFERENCES plants(id),
        FOREIGN KEY (companion_id) REFERENCES plants(id)
      );
    `);

  // Create antagonists table (many-to-many between plants)
  await db.exec(`
      CREATE TABLE IF NOT EXISTS antagonists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER NOT NULL,
        antagonist_id INTEGER NOT NULL,
        FOREIGN KEY (plant_id) REFERENCES plants(id),
        FOREIGN KEY (antagonist_id) REFERENCES plants(id)
      );
    `);

  // Create zones table
  await db.exec(`
      CREATE TABLE IF NOT EXISTS zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        min_temperature INTEGER,
        max_temperature INTEGER
      );
    `);

  // Create planting_seasons table linking plant_types and zones
  await db.exec(`
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

  console.log("Database initialized successfully.");
  dbInstance = db; // Store the instance
  return db;
};

// Export the database instance
export const getDatabase = async (): Promise<Database> => {
  if (!dbInstance) {
    await initializeDatabase();
  }
  return dbInstance!;
};

export default initializeDatabase;
