import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

const db = new DatabaseSync("plants.db");
db.exec("PRAGMA foreign_keys = ON;");

// Ensure users table and is_admin column exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
try {
  db.exec("ALTER TABLE users ADD COLUMN zone_id INTEGER REFERENCES zones(id)");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
} catch {}

const demoUsers = [
  {
    email: "admin@demo.com",
    password: "demo1234",
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
  },
  {
    email: "user@demo.com",
    password: "demo1234",
    firstName: "Demo",
    lastName: "User",
    isAdmin: false,
  },
];

const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (email, password, first_name, last_name, is_admin) VALUES (?, ?, ?, ?, ?)",
);

let count = 0;
for (const user of demoUsers) {
  const hash = bcrypt.hashSync(user.password, 12);
  const result = insertUser.run(
    user.email,
    hash,
    user.firstName,
    user.lastName,
    user.isAdmin ? 1 : 0,
  );
  if (result.changes > 0) count++;
}

console.log(`Seeded ${count} demo users`);
db.close();
