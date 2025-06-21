import { getDatabase } from "../databases/plantDb";
import { Plant } from "../types/plant";
import { v4 } from "uuid";

export class PlantRepository {
    async getPlants(): Promise<Plant[]> {
        const db = await getDatabase();
        const plants: Plant[] = [];
        const rows = await db.all("SELECT id, name, category, growth_form FROM plants");
        for (const row of rows) {
            plants.push({ id: row.id, name: row.name, category: row.category, growthForm: row.growth_form });
        }
        return plants;
    }

    async getPlantById(id: string): Promise<Plant | null> {
        const db = await getDatabase();
        const row = await db.get("SELECT id, name, category, growth_form FROM plants WHERE id = ?", [id]);
        return row ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form } : null;
    }

    async getPlantByName(name: string): Promise<Plant | null> {
        const db = await getDatabase();
        const row = await db.get("SELECT id, name, category, growth_form FROM plants WHERE name = ?", [name]);
        return row ? { id: row.id, name: row.name, category: row.category, growthForm: row.growth_form } : null;
    }

    async createPlant(plant: Plant): Promise<number | undefined> {
        const db = await getDatabase();
        const result = await db.run("INSERT INTO plants (name, category, growth_form, edible_part) VALUES (?, ?, ?, ?)", [plant.name, plant.category, plant.growthForm, plant.ediblePart || null]);
        return result.lastID
    }

    async updatePlant(id: string, plant: Plant): Promise<undefined> {
        const db = await getDatabase();
        await db.run("UPDATE plants SET name = ?, category = ?, growth_form = ? WHERE id = ?", [plant.name, plant.category, plant.growthForm, id]);
        return
    }

    async deletePlant(id: string): Promise<boolean> {
        const db = await getDatabase();
        await db.run("DELETE FROM plants WHERE id = ?", [id]);
        return true;
    }

    async getPlantTypesByPlantId(plantId: string): Promise<any[]> {
        const db = await getDatabase();
        const rows = await db.all("SELECT id, name, description, planting_notes FROM plant_types WHERE plant_id = ?", [plantId]);
        return rows.map(row => ({ id: row.id, name: row.name, description: row.description, plantingNotes: row.planting_notes }));

    }

    async createPlantType(plantId: string, plantType: any): Promise<any> {
        const db = await getDatabase();
        const id = v4();
        await db.run("INSERT INTO plant_types (id, plant_id, name, description, planting_notes) VALUES (?, ?, ?, ?, ?)", [id, plantId, plantType.name, plantType.description, plantType.planting_notes]);
        return { ...plantType, id };
    }

    async getCompanionsById(plantId: string): Promise<any> {
        const db = await getDatabase();
        const companions = await db.all("SELECT * FROM companions WHERE plant_id = ? OR companion_id = ?", [plantId, plantId]);
        return companions.map(companion => ({
            id: companion.id,
            plantId: companion.plant_id,
            companionId: companion.companion_id
        }));
    }

    // async updatePlantType(id: string, plantType: any): Promise<any | null> {
    //     const db = await getDatabase();
    //     const result = await db.run("UPDATE plant_types SET name = ?, description = ?, planting_notes = ? WHERE id = ?", [plantType.name, plantType.description, plantType.planting_notes, id]);
    //     return result.changes > 0 ? { ...plantType, id } : null;
    // }

    // async deletePlantType(id: string): Promise<boolean> {
    //     const db = await getDatabase();
    //     const result = await db.run("DELETE FROM plant_types WHERE id = ?", [id]);
    //     return result.changes > 0;
    // }

    async getCompanionsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const db = await getDatabase();
        const rows = await db.all("SELECT id, companion_id FROM companions WHERE plant_type_id = ?", [plantTypeId]);
        return rows.map(row => ({ id: row.id, companionId: row.companion_id }));
    }

    async createCompanion(plantTypeId: string, companionId: string): Promise<any> {
        const db = await getDatabase();
        await db.run("INSERT INTO companions (plant_type_id, companion_id) VALUES (?, ?, ?)", [plantTypeId, companionId]);
        return { plant_type_id: plantTypeId, companion_id: companionId };
    }

    async addCompanion(plant_id: string, companion_id: string): Promise<void> {
        const db = await getDatabase();
        await db.run(
            "INSERT INTO companions (plant_id, companion_id) VALUES (?, ?)",
            [plant_id, companion_id]
        );
    }

    // async deleteCompanion(id: string): Promise<boolean> {
    //     const db = await getDatabase();
    //     const result = await db.run("DELETE FROM companions WHERE id = ?", [id]);
    //     return result.changes > 0;
    // }

    async getAntagonistsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const db = await getDatabase();
        const rows = await db.all("SELECT id, antagonist_id FROM antagonists WHERE plant_type_id = ?", [plantTypeId]);
        return rows.map(row => ({ id: row.id, antagonist_id: row.antagonist_id }));
    }

    async createAntagonist(plant_id: string, antagonist_id: string): Promise<void> {
        const db = await getDatabase();
        await db.run(
            "INSERT INTO antagonists (plant_id, antagonist_id) VALUES (?, ?)",
            [plant_id, antagonist_id]
        );
    }

    async getAntagonistsById(plantId: string): Promise<any[]> {
        const db = await getDatabase();
        const rows = await db.all(
            "SELECT id, plant_id, antagonist_id FROM antagonists WHERE plant_id = ? Or antagonist_id = ?",
            [plantId, plantId]
        );
        return rows.map(rows => {
            return {
                id: rows.id,
                plantId: rows.plant_id,
                antagonistId: rows.antagonist_id
            };
        });
    }

    // async deleteAntagonist(id: string): Promise<boolean> {
    //     const db = await getDatabase();
    //     const result = await db.run("DELETE FROM antagonists WHERE id = ?", [id]);
    //     return result.changes > 0;
    // }

    async getPlantingSeasonsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const db = await getDatabase();
        const rows = await db.all("SELECT id, zone_id, start_month, end_month, method, notes FROM planting_seasons WHERE plant_type_id = ?", [plantTypeId]);
        return rows.map(row => ({ id: row.id, zone_id: row.zone_id, start_month: row.start_month, end_month: row.end_month, method: row.method, notes: row.notes }));
    }

    async createPlantingSeason(plantTypeId: string, plantingSeason: any): Promise<any> {
        const db = await getDatabase();
        const id = v4();
        await db.run("INSERT INTO planting_seasons (id, plant_type_id, zone_id, start_month, end_month, method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, plantTypeId, plantingSeason.zone_id, plantingSeason.start_month, plantingSeason.end_month, plantingSeason.method, plantingSeason.notes]);
        return { ...plantingSeason, id };
    }

    // async updatePlantingSeason(id: string, plantingSeason: any): Promise<any | null> {
    //     const db = await getDatabase();
    //     const result = await db.run("UPDATE planting_seasons SET zone_id = ?, start_month = ?, end_month = ?, method = ?, notes = ? WHERE id = ?", [plantingSeason.zone_id, plantingSeason.start_month, plantingSeason.end_month, plantingSeason.method, plantingSeason.notes, id]);
    //     return result.changes > 0 ? { ...plantingSeason, id } : null;
    // }

    // async deletePlantingSeason(id: string): Promise<boolean> {
    //     const db = await getDatabase();
    //     const result = await db.run("DELETE FROM planting_seasons WHERE id = ?", [id]);
    //     return result.changes > 0;
    // }
}

export const plantRepository = new PlantRepository();