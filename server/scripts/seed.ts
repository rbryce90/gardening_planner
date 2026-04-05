import { DatabaseSync } from "node:sqlite";
import seedData from "./seed-data.json" with { type: "json" };

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

// Insert zones
const insertZone = db.prepare(
  "INSERT OR IGNORE INTO zones (name, min_temperature, max_temperature) VALUES (?, ?, ?)",
);
let zoneCount = 0;
for (const zone of seedData.zones) {
  const result = insertZone.run(zone.name, zone.min_temperature, zone.max_temperature);
  if (result.changes > 0) zoneCount++;
}
console.log(`Inserted ${zoneCount} zones`);

// Insert plants
const insertPlant = db.prepare(
  "INSERT OR IGNORE INTO plants (name, category, growth_form, edible_part, family) VALUES (?, ?, ?, ?, ?)",
);
let plantCount = 0;
for (const plant of seedData.plants) {
  const result = insertPlant.run(
    plant.name,
    plant.category,
    plant.growth_form,
    plant.edible_part,
    plant.family,
  );
  if (result.changes > 0) plantCount++;
}
console.log(`Inserted ${plantCount} plants`);

// Insert plant_types
const getPlantByName = db.prepare("SELECT id FROM plants WHERE name = ?");
const insertPlantType = db.prepare(
  "INSERT INTO plant_types (plant_id, name, scientific_name, description, planting_notes) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM plant_types WHERE plant_id = ? AND name = ?)",
);
let typeCount = 0;
for (const type of seedData.plant_types) {
  const plant = getPlantByName.get(type.plant_name) as { id: number } | undefined;
  if (!plant) {
    console.warn(
      `Warning: plant not found for type "${type.name}" (plant_name: "${type.plant_name}")`,
    );
    continue;
  }
  const result = insertPlantType.run(
    plant.id,
    type.name,
    type.scientific_name,
    type.description,
    type.planting_notes,
    plant.id,
    type.name,
  );
  if (result.changes > 0) typeCount++;
}
console.log(`Inserted ${typeCount} plant types`);

// Insert companions
const getPlantId = (name: string): number | undefined => {
  const row = getPlantByName.get(name) as { id: number } | undefined;
  return row?.id;
};
const insertCompanion = db.prepare(
  "INSERT INTO companions (plant_id, companion_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM companions WHERE plant_id = ? AND companion_id = ?)",
);
let companionCount = 0;
for (const companion of seedData.companions) {
  const idA = getPlantId(companion.plant_name);
  const idB = getPlantId(companion.companion_name);
  if (!idA || !idB) {
    console.warn(
      `Warning: could not resolve companion pair "${companion.plant_name}" + "${companion.companion_name}"`,
    );
    continue;
  }
  // Enforce lower ID first
  const plantId = Math.min(idA, idB);
  const companionId = Math.max(idA, idB);
  const result = insertCompanion.run(plantId, companionId, plantId, companionId);
  if (result.changes > 0) companionCount++;
}
console.log(`Inserted ${companionCount} companions`);

// Insert antagonists
const insertAntagonist = db.prepare(
  "INSERT INTO antagonists (plant_id, antagonist_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM antagonists WHERE plant_id = ? AND antagonist_id = ?)",
);
let antagonistCount = 0;
for (const antagonist of seedData.antagonists) {
  const idA = getPlantId(antagonist.plant_name);
  const idB = getPlantId(antagonist.antagonist_name);
  if (!idA || !idB) {
    console.warn(
      `Warning: could not resolve antagonist pair "${antagonist.plant_name}" + "${antagonist.antagonist_name}"`,
    );
    continue;
  }
  // Enforce lower ID first
  const plantId = Math.min(idA, idB);
  const antagonistId = Math.max(idA, idB);
  const result = insertAntagonist.run(plantId, antagonistId, plantId, antagonistId);
  if (result.changes > 0) antagonistCount++;
}
console.log(`Inserted ${antagonistCount} antagonists`);

// Insert planting_seasons
const getPlantTypeByName = db.prepare("SELECT id FROM plant_types WHERE name = ?");
const getZoneByName = db.prepare("SELECT id FROM zones WHERE name = ?");
const insertSeason = db.prepare(
  "INSERT INTO planting_seasons (plant_type_id, zone_id, start_month, end_month, method, notes) SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM planting_seasons WHERE plant_type_id = ? AND zone_id = ?)",
);
let seasonCount = 0;
for (const season of seedData.planting_seasons) {
  const plantType = getPlantTypeByName.get(season.plant_type_name) as { id: number } | undefined;
  const zone = getZoneByName.get(season.zone_name) as { id: number } | undefined;
  if (!plantType) {
    console.warn(
      `Warning: plant type not found for season (plant_type_name: "${season.plant_type_name}")`,
    );
    continue;
  }
  if (!zone) {
    console.warn(`Warning: zone not found for season (zone_name: "${season.zone_name}")`);
    continue;
  }
  const result = insertSeason.run(
    plantType.id,
    zone.id,
    season.start_month,
    season.end_month,
    season.method,
    season.notes,
    plantType.id,
    zone.id,
  );
  if (result.changes > 0) seasonCount++;
}
console.log(`Inserted ${seasonCount} planting seasons`);

db.close();
console.log("Seed complete.");
