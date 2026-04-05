import { DatabaseSync } from "node:sqlite";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    const dbPath = process.env.DB_PATH || "plants.db";
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("PRAGMA journal_mode = WAL");
  }
  return db;
}

export function resetDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
