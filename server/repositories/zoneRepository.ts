import { getDatabase } from "../databases/plantDb.ts";
import type { Zone, PlantingSeason } from "../types/zone.d.ts";

export class ZoneRepository {
  async getZones(): Promise<Zone[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT id, name, min_temperature, max_temperature FROM zones ORDER BY id")
      .all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      minTemperature: row.min_temperature,
      maxTemperature: row.max_temperature,
    }));
  }

  async getPlantingCalendar(zoneId: number): Promise<PlantingSeason[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
            SELECT
                ps.id,
                ps.start_month,
                ps.end_month,
                ps.method,
                ps.notes,
                pt.name as plant_type_name,
                p.name as plant_name
            FROM planting_seasons ps
            JOIN plant_types pt ON ps.plant_type_id = pt.id
            JOIN plants p ON pt.plant_id = p.id
            WHERE ps.zone_id = ?
            ORDER BY p.name, pt.name
        `,
      )
      .all(zoneId) as any[];
    return rows.map((row) => ({
      id: row.id,
      startMonth: row.start_month,
      endMonth: row.end_month,
      method: row.method,
      notes: row.notes,
      plantTypeName: row.plant_type_name,
      plantName: row.plant_name,
    }));
  }
}

export const zoneRepository = new ZoneRepository();
