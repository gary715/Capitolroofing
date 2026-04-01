import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const entries = db.prepare(`
    SELECT * FROM daily_log WHERE project_id = ? ORDER BY log_date DESC, created_at DESC
  `).all(id);
  return Response.json(entries);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO daily_log (project_id, log_date, crew_count, area_worked, squares_completed, work_description, weather, issues)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.log_date ?? new Date().toISOString().slice(0, 10),
    body.crew_count ?? null,
    body.area_worked ?? null,
    body.squares_completed ?? null,
    body.work_description ?? null,
    body.weather ?? null,
    body.issues ?? null,
  );

  return Response.json({ ok: true, id: result.lastInsertRowid });
}
