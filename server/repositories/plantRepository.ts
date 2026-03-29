import { getDatabase } from "../databases/plantDb.ts";
import type { Plant } from "../types/plant.d.ts";
import { v4 } from "uuid";

export class PlantRepository {
    async getPlants(): Promise<Plant[]> {
        const db = getDatabase();
        const plants: Plant[] = [];
        const rows = db.prepare("SELECT id, name, category, growth_form FROM plants").all() as any[];
        for (const row of rows) {
            plants.push({ id: row.id, name: row.name, category: row.category, growthForm: row.growth_form });
        }
        return plants;
    }

    async getPlantById(id: string): Promise<Plant | null> {
        const db = getDatabase();
        const row = db.prepare("SELECT id, name, category, growth_form FROM plants WHERE id = ?").get(id) as any;
        return row ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form } : null;
    }

    async getPlantByName(name: string): Promise<Plant | null> {
        const db = getDatabase();
        const row = db.prepare("SELECT id, name, category, growth_form FROM plants WHERE name = ?").get(name) as any;
        return row ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form } : null;
    }

    async createPlant(plant: Plant): Promise<number | undefined> {
        const db = getDatabase();
        const result = db.prepare("INSERT INTO plants (name, category, growth_form, edible_part) VALUES (?, ?, ?, ?)").run(plant.name, plant.category, plant.growthForm, plant.ediblePart || null);
        return Number(result.lastInsertRowid);
    }

    async updatePlant(id: string, plant: Plant): Promise<undefined> {
        const db = getDatabase();
        db.prepare("UPDATE plants SET name = ?, category = ?, growth_form = ? WHERE id = ?").run(plant.name, plant.category, plant.growthForm, id);
        return;
    }

    async deletePlant(id: string): Promise<boolean> {
        const db = getDatabase();
        db.prepare("DELETE FROM plants WHERE id = ?").run(id);
        return true;
    }

    async getPlantTypesByPlantId(plantId: string): Promise<any[]> {
        const db = getDatabase();
        const rows = db.prepare("SELECT id, name, description, planting_notes FROM plant_types WHERE plant_id = ?").all(plantId) as any[];
        return rows.map(row => ({ id: row.id, name: row.name, description: row.description, plantingNotes: row.planting_notes }));
    }

    async createPlantType(plantId: string, plantType: any): Promise<any> {
        const db = getDatabase();
        const id = v4();
        db.prepare("INSERT INTO plant_types (id, plant_id, name, description, planting_notes) VALUES (?, ?, ?, ?, ?)").run(id, plantId, plantType.name, plantType.description, plantType.planting_notes);
        return { ...plantType, id };
    }

    async getCompanionsById(plantId: string): Promise<any> {
        const db = getDatabase();
        const companions = db.prepare("SELECT * FROM companions WHERE plant_id = ? OR companion_id = ?").all(plantId, plantId) as any[];
        return companions.map(companion => ({
            id: companion.id,
            plantId: companion.plant_id,
            companionId: companion.companion_id
        }));
    }

    async addCompanion(plant_id: string, companion_id: string): Promise<void> {
        const db = getDatabase();
        db.prepare("INSERT INTO companions (plant_id, companion_id) VALUES (?, ?)").run(plant_id, companion_id);
    }

    async createAntagonist(plant_id: string, antagonist_id: string): Promise<void> {
        const db = getDatabase();
        db.prepare("INSERT INTO antagonists (plant_id, antagonist_id) VALUES (?, ?)").run(plant_id, antagonist_id);
    }

    async getAntagonistsById(plantId: string): Promise<any[]> {
        const db = getDatabase();
        const rows = db.prepare(
            "SELECT id, plant_id, antagonist_id FROM antagonists WHERE plant_id = ? OR antagonist_id = ?"
        ).all(plantId, plantId) as any[];
        return rows.map(row => {
            return {
                id: row.id,
                plantId: row.plant_id,
                antagonistId: row.antagonist_id
            };
        });
    }

    async getAllCompanions(): Promise<Array<{ plantId: number; companionId: number }>> {
        const db = getDatabase();
        const rows = db.prepare("SELECT plant_id, companion_id FROM companions").all() as any[];
        return rows.map(row => ({ plantId: row.plant_id, companionId: row.companion_id }));
    }

    async getAllAntagonists(): Promise<Array<{ plantId: number; antagonistId: number }>> {
        const db = getDatabase();
        const rows = db.prepare("SELECT plant_id, antagonist_id FROM antagonists").all() as any[];
        return rows.map(row => ({ plantId: row.plant_id, antagonistId: row.antagonist_id }));
    }

    async getPlantingSeasonsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const db = getDatabase();
        const rows = db.prepare("SELECT id, zone_id, start_month, end_month, method, notes FROM planting_seasons WHERE plant_type_id = ?").all(plantTypeId) as any[];
        return rows.map(row => ({ id: row.id, zone_id: row.zone_id, start_month: row.start_month, end_month: row.end_month, method: row.method, notes: row.notes }));
    }

    async createPlantingSeason(plantTypeId: string, plantingSeason: any): Promise<any> {
        const db = getDatabase();
        const id = v4();
        db.prepare("INSERT INTO planting_seasons (id, plant_type_id, zone_id, start_month, end_month, method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, plantTypeId, plantingSeason.zone_id, plantingSeason.start_month, plantingSeason.end_month, plantingSeason.method, plantingSeason.notes);
        return { ...plantingSeason, id };
    }
}

export const plantRepository = new PlantRepository();
