import { getDatabase } from "../databases/gardenDb.ts";
import type { Garden, GardenCell } from "../types/garden.d.ts";

class GardenRepository {
  getGardens(userId: number): Garden[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT id, user_id, name, rows, cols, created_at FROM gardens WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(userId) as any[];
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      rows: row.rows,
      cols: row.cols,
      createdAt: row.created_at,
    }));
  }

  createGarden(userId: number, name: string, rows: number, cols: number): Garden {
    const db = getDatabase();
    const result = db
      .prepare("INSERT INTO gardens (user_id, name, rows, cols) VALUES (?, ?, ?, ?)")
      .run(userId, name, rows, cols);
    const id = Number(result.lastInsertRowid);
    const row = db
      .prepare("SELECT id, user_id, name, rows, cols, created_at FROM gardens WHERE id = ?")
      .get(id) as any;
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      rows: row.rows,
      cols: row.cols,
      createdAt: row.created_at,
    };
  }

  getGardenById(gardenId: number, userId: number): Garden | null {
    const db = getDatabase();
    const row = db
      .prepare(
        "SELECT id, user_id, name, rows, cols, created_at FROM gardens WHERE id = ? AND user_id = ?",
      )
      .get(gardenId, userId) as any;
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      rows: row.rows,
      cols: row.cols,
      createdAt: row.created_at,
    };
  }

  getGardenCells(gardenId: number): GardenCell[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT gc.id, gc.garden_id, gc.row, gc.col, gc.plant_id, p.name as plant_name
             FROM garden_cells gc
             JOIN plants p ON gc.plant_id = p.id
             WHERE gc.garden_id = ?
             ORDER BY gc.row, gc.col`,
      )
      .all(gardenId) as any[];
    return rows.map((row) => ({
      id: row.id,
      gardenId: row.garden_id,
      row: row.row,
      col: row.col,
      plantId: row.plant_id,
      plantName: row.plant_name,
    }));
  }

  upsertCell(gardenId: number, row: number, col: number, plantId: number): void {
    const db = getDatabase();
    db.prepare(
      "INSERT INTO garden_cells (garden_id, row, col, plant_id) VALUES (?, ?, ?, ?) ON CONFLICT(garden_id, row, col) DO UPDATE SET plant_id = excluded.plant_id",
    ).run(gardenId, row, col, plantId);
  }

  clearCell(gardenId: number, row: number, col: number): boolean {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM garden_cells WHERE garden_id = ? AND row = ? AND col = ?")
      .run(gardenId, row, col);
    return result.changes > 0;
  }

  deleteGarden(gardenId: number, userId: number): boolean {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM gardens WHERE id = ? AND user_id = ?")
      .run(gardenId, userId);
    return result.changes > 0;
  }
}

export const gardenRepository = new GardenRepository();
