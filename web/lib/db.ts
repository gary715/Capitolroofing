import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "..", "data", "db", "capitol_roofing.db");

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db: ReturnType<typeof import("better-sqlite3")> | null = null;

export function getDb() {
  if (_db) return _db;

  const Database = require("better-sqlite3");
  _db = new Database(DB_PATH);

  _db!.exec(`
    CREATE TABLE IF NOT EXISTS estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      job_address TEXT,
      job_type TEXT,
      squares REAL,
      penetration_count INTEGER,
      building_height INTEGER,
      walk_distance INTEGER,
      high_foot_traffic INTEGER DEFAULT 0,
      notes TEXT,
      raw_document TEXT,
      parsed_output TEXT,
      flags TEXT,
      subtotal REAL,
      total REAL,
      status TEXT DEFAULT 'open'
        CHECK(status IN ('open','sent','won','lost')),
      lost_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS material_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER REFERENCES estimates(id),
      job_address TEXT,
      raw_field_notes TEXT,
      parsed_items TEXT,
      flags TEXT,
      status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','ready','printed')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_id INTEGER REFERENCES estimates(id),
      material_list_id INTEGER REFERENCES material_lists(id),
      job_address TEXT,
      folder_path TEXT,
      phase TEXT DEFAULT 'estimate'
        CHECK(phase IN ('estimate','active','completed')),
      start_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS upload_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      section TEXT,
      document_type TEXT,
      routed_to TEXT,
      result_id INTEGER,
      result_table TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT,
      category TEXT,
      unit TEXT,
      notes TEXT
    );
  `);

  return _db!;
}

export type EstimateStatus = "open" | "sent" | "won" | "lost";

export interface Estimate {
  id: number;
  customer_name: string | null;
  job_address: string | null;
  job_type: string | null;
  squares: number | null;
  notes: string | null;
  parsed_output: string | null;
  flags: string | null;
  total: number | null;
  status: EstimateStatus;
  lost_reason: string | null;
  created_at: string;
}

export interface MaterialList {
  id: number;
  estimate_id: number | null;
  job_address: string | null;
  parsed_items: string | null;
  flags: string | null;
  status: string;
  created_at: string;
}
