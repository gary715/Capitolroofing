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

    CREATE TABLE IF NOT EXISTS active_projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      status TEXT DEFAULT 'active'
        CHECK(status IN ('active','completed','on_hold')),
      total_squares REAL,
      system_type TEXT,
      manufacturer TEXT,
      folder_path TEXT,
      start_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT REFERENCES active_projects(id),
      log_date TEXT NOT NULL,
      crew_count INTEGER,
      area_worked TEXT,
      squares_completed REAL,
      work_description TEXT,
      weather TEXT,
      issues TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS estimate_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      roofing_type TEXT,
      insulation_type TEXT,
      total_squares REAL,
      stories INTEGER,
      notes TEXT,
      status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','ready','processing','complete','error')),
      missing_fields TEXT,
      result TEXT,
      questions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS estimate_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimate_queue_id INTEGER NOT NULL REFERENCES estimate_queue(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_category TEXT DEFAULT 'other'
        CHECK(file_category IN ('satellite','spec','plan','photo','walkthrough','other')),
      file_path TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT REFERENCES active_projects(id),
      delivery_date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('material','dumpster_drop','dumpster_pickup')),
      description TEXT,
      supplier TEXT,
      quantity TEXT,
      dumpster_number INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer'
        CHECK(role IN ('admin','estimator','foreman','viewer')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default admin if no users exist
  const userCount = (_db!.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  if (userCount === 0) {
    const bcrypt = require("bcryptjs");
    const hash = bcrypt.hashSync("admin123", 10);
    _db!.prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)"
    ).run("admin@capitolroofing.com", hash, "Admin", "admin");
  }

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
