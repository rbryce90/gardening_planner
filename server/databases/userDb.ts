import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("user.db");

// enable foreign keys
db.query(`PRAGMA foreign_keys = ON;`);

db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_customer_id TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, 
    phone_number TEXT NOT NULL
);`);

db.query(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,           
    user_id INTEGER,               
    data TEXT,                     
    expiry DATETIME,               
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

export default db;
