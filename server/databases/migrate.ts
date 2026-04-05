import { DatabaseSync } from "node:sqlite";
import { getDb } from "./db.ts";
import logger from "../utils/logger.ts";

interface Migration {
  version: number;
  up: (db: DatabaseSync) => void;
}

function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      if (!hasColumn(db, "users", "zone_id")) {
        db.exec("ALTER TABLE users ADD COLUMN zone_id INTEGER REFERENCES zones(id)");
      }
      if (!hasColumn(db, "users", "is_admin")) {
        db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
      }
    },
  },
];

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const row = db.prepare("SELECT MAX(version) as current_version FROM schema_version").get() as {
    current_version: number | null;
  };
  const currentVersion = row.current_version ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      migration.up(db);
      db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(migration.version);
      logger.info(`Applied migration ${migration.version}`);
    }
  }
}
