// zone repostory 
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import db from "../databases/plantDb.ts";

export class ZoneRepository {
    async getZones(): Promise<any[]> {
        const zones: any[] = [];
        for (const [id, name, min_temperature, max_temperature] of db.query("SELECT id, name, min_temperature, max_temperature FROM zones")) {
            console.log(zones)
            zones.push({ id, name, min_temperature, max_temperature });
        }
        return zones;
    }

    async getZoneById(id: string): Promise<any | null> {
        const result = db.query("SELECT id, name, min_temperature, max_temperature FROM zones WHERE id = ?", [id]);
        if (result.length > 0) {
            const data = result[0]
            return { id: data[0], name: data[1], minTempature: data[2], maxTemperature: data[3] }
        } else {
            throw Error('Id not found')
        }
    }

    async createZone(zone: any): Promise<any> {
        const id = v4.generate();
        db.query("INSERT INTO zones (id, name, min_temperature, max_temperature) VALUES (?, ?, ?, ?)", [id, zone.name, zone.min_temperature, zone.max_temperature]);
        return { ...zone, id };
    }

    async updateZone(id: string, zone: any): Promise<any | null> {
        const result = db.query("UPDATE zones SET name = ?, min_temperature = ?, max_temperature = ? WHERE id = ?", [zone.name, zone.min_temperature, zone.max_temperature, id]);
        return result.rowsAffected > 0 ? { ...zone, id } : null;
    }

    async deleteZone(id: string): Promise<boolean> {
        const result = db.query("DELETE FROM zones WHERE id = ?", [id]);
        return result.rowsAffected > 0;
    }
}
export default ZoneRepository;
