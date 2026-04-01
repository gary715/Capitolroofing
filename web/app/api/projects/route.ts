import { getDb } from "@/lib/db";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

const JOBS_DIR = join(process.cwd(), "..", "jobs", "active");

// Seed a project from its folder's project.json if not already in DB
function seedProjectIfNeeded(db: ReturnType<typeof getDb>, projectId: string) {
  const existing = db.prepare("SELECT id FROM active_projects WHERE id = ?").get(projectId);
  if (existing) return;

  try {
    const jsonPath = join(JOBS_DIR, projectId, "project.json");
    const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
    db.prepare(`
      INSERT INTO active_projects (id, name, address, total_squares, system_type, manufacturer, folder_path, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      data.id,
      data.name,
      data.address ?? null,
      data.roof?.total_squares ?? null,
      data.system?.membrane?.type ?? null,
      data.system?.manufacturer ?? null,
      join("jobs", "active", projectId),
    );
  } catch {
    // Skip folders without project.json
  }
}

export async function GET() {
  const db = getDb();

  // Auto-discover active job folders and seed them
  try {
    const folders = readdirSync(JOBS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    for (const folder of folders) {
      seedProjectIfNeeded(db, folder);
    }
  } catch {
    // Jobs dir may not exist yet
  }

  const projects = db.prepare(`
    SELECT p.*,
      COUNT(DISTINCT d.id) as log_count,
      MAX(d.log_date) as last_log_date,
      SUM(d.squares_completed) as total_sq_completed
    FROM active_projects p
    LEFT JOIN daily_log d ON d.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();

  return Response.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO active_projects (id, name, address, total_squares, system_type, manufacturer, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `).run(
    body.id ?? body.name.toLowerCase().replace(/\s+/g, "-"),
    body.name,
    body.address ?? null,
    body.total_squares ?? null,
    body.system_type ?? null,
    body.manufacturer ?? null,
  );
  return Response.json({ ok: true, id: result.lastInsertRowid });
}
