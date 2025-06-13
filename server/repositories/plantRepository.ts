// make repository for plant entity
import db from "../databases/plantDb.ts";
import { Plant } from "../models/plantModels.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

// make the needed queries for the plant entity
export class PlantRepository {
    async getPlants(): Promise<Plant[]> {
        const plants: Plant[] = [];
        for (const [id, name, category, growth_form] of db.query("SELECT id, name, category, growth_form FROM plants")) {
            plants.push({ id, name, category, growthForm: growth_form });
        }
        return plants;
    }

    async getPlantById(id: string): Promise<Plant | null> {
        const result = db.query("SELECT id, name, category, growth_form FROM plants WHERE id = ?", [id]);
        const plant = result[0]
        return plant ? { id: plant[0], name: plant[1], category: plant[2], growthForm: plant[3] } : null;
    }

    async createPlant(plant: Plant): Promise<Plant> {
        const id = v4.generate();
        db.query("INSERT INTO plants (id, name, category, growth_form) VALUES (?, ?, ?, ?)", [id, plant.name, plant.category, plant.growth_form]);
        return { ...plant, id };
    }

    async updatePlant(id: string, plant: Plant): Promise<Plant | null> {
        const result = db.query("UPDATE plants SET name = ?, category = ?, growth_form = ? WHERE id = ?", [plant.name, plant.category, plant.growth_form, id]);
        return result.rowsAffected > 0 ? { ...plant, id } : null;
    }

    async deletePlant(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM plants WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }

    async getPlantTypesByPlantId(plantId: string): Promise<any[]> {
        const plantTypes: any[] = [];
        for (const [id, name, description, planting_notes] of db.query("SELECT id, name, description, planting_notes FROM plant_types WHERE plant_id = ?", [plantId])) {
            plantTypes.push({ id, name, description, planting_notes });
        }
        return plantTypes;
    }
    async createPlantType(plantId: string, plantType: any): Promise<any> {
        const id = v4.generate();
        db.query("INSERT INTO plant_types (id, plant_id, name, description, planting_notes) VALUES (?, ?, ?, ?, ?)", [id, plantId, plantType.name, plantType.description, plantType.planting_notes]);
        return { ...plantType, id };
    }
    async updatePlantType(id: string, plantType: any): Promise<any | null> {
        const result = db.query("UPDATE plant_types SET name = ?, description = ?, planting_notes = ? WHERE id = ?", [plantType.name, plantType.description, plantType.planting_notes, id]);
        return result.rowsAffected > 0 ? { ...plantType, id } : null;
    }
    async deletePlantType(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM plant_types WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }

    async getCompanionsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const companions: any[] = [];
        for (const [id, companionId] of db.query("SELECT id, companion_id FROM companions WHERE plant_type_id = ?", [plantTypeId])) {
            companions.push({ id, companionId });
        }
        return companions;
    }
    async createCompanion(plantTypeId: string, companionId: string): Promise<any> {
        const id = v4.generate();
        db.query("INSERT INTO companions (id, plant_type_id, companion_id) VALUES (?, ?, ?)", [id, plantTypeId, companionId]);
        return { id, plant_type_id: plantTypeId, companion_id: companionId };
    }
    async deleteCompanion(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM companions WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }
    async getAntagonistsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const antagonists: any[] = [];
        for (const [id, antagonist_id] of db.query("SELECT id, antagonist_id FROM antagonists WHERE plant_type_id = ?", [plantTypeId])) {
            antagonists.push({ id, antagonist_id });
        }
        return antagonists;
    }
    async createAntagonist(plantTypeId: string, antagonistId: string): Promise<any> {
        const id = v4.generate();
        db.query("INSERT INTO antagonists (id, plant_type_id, antagonist_id) VALUES (?, ?, ?)", [id, plantTypeId, antagonistId]);
        return { id, plant_type_id: plantTypeId, antagonist_id: antagonistId };
    }
    async deleteAntagonist(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM antagonists WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }
    async getPlantingSeasonsByPlantTypeId(plantTypeId: string): Promise<any[]> {
        const plantingSeasons: any[] = [];
        for (const [id, zone_id, start_month, end_month, method, notes] of db.query("SELECT id, zone_id, start_month, end_month, method, notes FROM planting_seasons WHERE plant_type_id = ?", [plantTypeId])) {
            plantingSeasons.push({ id, zone_id, start_month, end_month, method, notes });
        }
        return plantingSeasons;
    }
    async createPlantingSeason(plantTypeId: string, plantingSeason: any): Promise<any> {
        const id = v4.generate();
        db.query("INSERT INTO planting_seasons (id, plant_type_id, zone_id, start_month, end_month, method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, plantTypeId, plantingSeason.zone_id, plantingSeason.start_month, plantingSeason.end_month, plantingSeason.method, plantingSeason.notes]);
        return { ...plantingSeason, id };
    }
    async updatePlantingSeason(id: string, plantingSeason: any): Promise<any | null> {
        const result = db.query("UPDATE planting_seasons SET zone_id = ?, start_month = ?, end_month = ?, method = ?, notes = ? WHERE id = ?",
            [plantingSeason.zone_id, plantingSeason.start_month, plantingSeason.end_month, plantingSeason.method, plantingSeason.notes, id]);
        return result.rowsAffected > 0 ? { ...plantingSeason, id } : null;
    }
    async deletePlantingSeason(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM planting_seasons WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }
}

export const plantRepository = new PlantRepository();