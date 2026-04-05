import * as fs from "fs";
import * as path from "path";

const TEST_DB_PATH = path.join(__dirname, "test_plants.db");

// Set the DB_PATH env var BEFORE any module imports the db singleton
process.env.DB_PATH = TEST_DB_PATH;

export function setupTestDb(): void {
  cleanupTestDb();
}

export function cleanupTestDb(): void {
  const { resetDb } = require("../databases/db.ts");
  resetDb();
  for (const suffix of ["", "-shm", "-wal"]) {
    const file = TEST_DB_PATH + suffix;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

export function initAllTables(): void {
  const initPlantDb = require("../databases/plantDb.ts").default;
  const initUserDb = require("../databases/userDb.ts").default;
  const initGardenDb = require("../databases/gardenDb.ts").default;
  const { runMigrations } = require("../databases/migrate.ts");

  initPlantDb();
  initUserDb();
  initGardenDb();
  runMigrations();
}
