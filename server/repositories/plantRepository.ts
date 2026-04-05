import { getDatabase } from "../databases/plantDb.ts";
import type { Plant, PlantType } from "../types/plant.d.ts";

export class PlantRepository {
  async getPlants(): Promise<Plant[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT id, name, category, growth_form FROM plants").all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      growthForm: row.growth_form,
    }));
  }

  async getPlantById(id: number): Promise<Plant | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT id, name, category, growth_form FROM plants WHERE id = ?")
      .get(id) as any;
    return row
      ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form }
      : null;
  }

  async getPlantByName(name: string): Promise<Plant | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT id, name, category, growth_form FROM plants WHERE name = ?")
      .get(name) as any;
    return row
      ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form }
      : null;
  }

  async createPlant(plant: Plant): Promise<number | undefined> {
    const db = getDatabase();
    const result = db
      .prepare("INSERT INTO plants (name, category, growth_form, edible_part) VALUES (?, ?, ?, ?)")
      .run(plant.name, plant.category, plant.growthForm, plant.ediblePart || null);
    return Number(result.lastInsertRowid);
  }

  async updatePlant(id: number, plant: Plant): Promise<undefined> {
    const db = getDatabase();
    db.prepare("UPDATE plants SET name = ?, category = ?, growth_form = ? WHERE id = ?").run(
      plant.name,
      plant.category,
      plant.growthForm,
      id,
    );
    return;
  }

  async deletePlant(id: number): Promise<boolean> {
    const db = getDatabase();
    db.prepare("DELETE FROM plants WHERE id = ?").run(id);
    return true;
  }

  async getPlantTypesByPlantId(plantId: number): Promise<any[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT id, name, description, planting_notes FROM plant_types WHERE plant_id = ?")
      .all(plantId) as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      plantingNotes: row.planting_notes,
    }));
  }

  async createPlantType(plantId: number, plantType: PlantType): Promise<PlantType> {
    const db = getDatabase();
    const result = db
      .prepare(
        "INSERT INTO plant_types (plant_id, name, description, planting_notes) VALUES (?, ?, ?, ?)",
      )
      .run(plantId, plantType.name, plantType.description ?? null, plantType.plantingNotes ?? null);
    return { id: Number(result.lastInsertRowid), ...plantType };
  }

  async getCompanionsById(plantId: number): Promise<any> {
    const db = getDatabase();
    const companions = db
      .prepare("SELECT * FROM companions WHERE plant_id = ? OR companion_id = ?")
      .all(plantId, plantId) as any[];
    return companions.map((companion) => ({
      id: companion.id,
      plantId: companion.plant_id,
      companionId: companion.companion_id,
    }));
  }

  async getCompanionPlantsById(plantId: number): Promise<Plant[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT p.id, p.name, p.category, p.growth_form FROM plants p
             JOIN companions c ON (c.companion_id = p.id AND c.plant_id = ?) OR (c.plant_id = p.id AND c.companion_id = ?)`,
      )
      .all(plantId, plantId) as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      growthForm: row.growth_form,
    }));
  }

  async getAntagonistPlantsById(plantId: number): Promise<Plant[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT p.id, p.name, p.category, p.growth_form FROM plants p
             JOIN antagonists a ON (a.antagonist_id = p.id AND a.plant_id = ?) OR (a.plant_id = p.id AND a.antagonist_id = ?)`,
      )
      .all(plantId, plantId) as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      growthForm: row.growth_form,
    }));
  }

  async addCompanion(plantId: number, companionId: number): Promise<void> {
    const db = getDatabase();
    const [lowId, highId] = plantId < companionId ? [plantId, companionId] : [companionId, plantId];
    db.prepare("INSERT INTO companions (plant_id, companion_id) VALUES (?, ?)").run(lowId, highId);
  }

  async createAntagonist(plantId: number, antagonistId: number): Promise<void> {
    const db = getDatabase();
    const [lowId, highId] =
      plantId < antagonistId ? [plantId, antagonistId] : [antagonistId, plantId];
    db.prepare("INSERT INTO antagonists (plant_id, antagonist_id) VALUES (?, ?)").run(
      lowId,
      highId,
    );
  }

  async getAntagonistsById(plantId: number): Promise<any[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT id, plant_id, antagonist_id FROM antagonists WHERE plant_id = ? OR antagonist_id = ?",
      )
      .all(plantId, plantId) as any[];
    return rows.map((row) => ({
      id: row.id,
      plantId: row.plant_id,
      antagonistId: row.antagonist_id,
    }));
  }

  async getAllCompanions(): Promise<Array<{ plantId: number; companionId: number }>> {
    const db = getDatabase();
    const rows = db.prepare("SELECT plant_id, companion_id FROM companions").all() as any[];
    return rows.map((row) => ({ plantId: row.plant_id, companionId: row.companion_id }));
  }

  async getAllAntagonists(): Promise<Array<{ plantId: number; antagonistId: number }>> {
    const db = getDatabase();
    const rows = db.prepare("SELECT plant_id, antagonist_id FROM antagonists").all() as any[];
    return rows.map((row) => ({ plantId: row.plant_id, antagonistId: row.antagonist_id }));
  }

  async getPlantingSeasonsByPlantTypeId(plantTypeId: number): Promise<any[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT id, zone_id, start_month, end_month, method, notes FROM planting_seasons WHERE plant_type_id = ?",
      )
      .all(plantTypeId) as any[];
    return rows.map((row) => ({
      id: row.id,
      zone_id: row.zone_id,
      start_month: row.start_month,
      end_month: row.end_month,
      method: row.method,
      notes: row.notes,
    }));
  }

  async createPlantingSeason(plantTypeId: number, plantingSeason: any): Promise<any> {
    const db = getDatabase();
    const result = db
      .prepare(
        "INSERT INTO planting_seasons (plant_type_id, zone_id, start_month, end_month, method, notes) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        plantTypeId,
        plantingSeason.zone_id,
        plantingSeason.start_month,
        plantingSeason.end_month,
        plantingSeason.method,
        plantingSeason.notes,
      );
    return { ...plantingSeason, id: Number(result.lastInsertRowid) };
  }
}

export const plantRepository = new PlantRepository();
