import path from "path";
import fs from "fs";

// Database file lives at the root of the project (outside web/)
const DB_PATH = path.join(process.cwd(), "..", "data", "db", "capitol_roofing.db");

// Ensure the db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db: ReturnType<typeof import("better-sqlite3")> | null = null;

export function getDb() {
  if (_db) return _db;

  // Dynamic require so it only runs server-side
  const Database = require("better-sqlite3");
  _db = new Database(DB_PATH);

  // Run schema on first connection
  _db!.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      job_address TEXT,
      job_type TEXT CHECK(job_type IN ('tearoff', 'overlay')),
      squares REAL,
      layers INTEGER,
      penetration_count INTEGER,
      building_height INTEGER,
      walk_distance INTEGER,
      high_foot_traffic INTEGER DEFAULT 0,
      decking_condition TEXT,
      notes TEXT,
      subtotal REAL,
      total REAL,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS material_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER REFERENCES estimates(id),
      job_address TEXT,
      raw_field_notes TEXT,
      parsed_items TEXT,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS abbreviations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      abbreviation TEXT UNIQUE NOT NULL,
      meaning TEXT NOT NULL,
      category TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT,
      category TEXT,
      description TEXT,
      unit TEXT,
      coverage_per_unit REAL,
      notes TEXT
    );
  `);

  return _db!;
}
