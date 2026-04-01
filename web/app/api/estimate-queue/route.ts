import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/authorize";

const REQUIRED_FIELDS = ["name", "address", "roofing_type", "insulation_type"];

function computeReadiness(row: Record<string, unknown>, fileCount: number) {
  const missing: string[] = [];
  for (const f of REQUIRED_FIELDS) {
    if (!row[f]) missing.push(f);
  }
  if (fileCount === 0) missing.push("satellite image");
  return {
    status: missing.length === 0 ? "ready" : "draft",
    missing_fields: JSON.stringify(missing),
  };
}

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const db = getDb();
  const items = db.prepare(`
    SELECT q.*,
      (SELECT COUNT(*) FROM estimate_files WHERE estimate_queue_id = q.id) as file_count,
      (SELECT GROUP_CONCAT(file_name, ', ') FROM estimate_files WHERE estimate_queue_id = q.id) as file_names,
      (SELECT COUNT(*) FROM estimate_files WHERE estimate_queue_id = q.id AND file_category = 'satellite') as satellite_count
    FROM estimate_queue q
    ORDER BY q.created_at DESC
  `).all();
  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO estimate_queue (name, address, roofing_type, insulation_type, total_squares, stories, notes, status, missing_fields)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.name,
    body.address ?? null,
    body.roofing_type ?? null,
    body.insulation_type ?? null,
    body.total_squares ?? null,
    body.stories ?? null,
    body.notes ?? null,
    "draft",
    JSON.stringify(REQUIRED_FIELDS.filter(f => !body[f]).concat(["satellite image"])),
  );

  return Response.json({ ok: true, id: result.lastInsertRowid });
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  if (body.id && body.field && body.value !== undefined) {
    const allowed = ["name", "address", "roofing_type", "insulation_type", "total_squares", "stories", "notes"];
    if (!allowed.includes(body.field)) {
      return Response.json({ error: "Invalid field" }, { status: 400 });
    }
    db.prepare(`UPDATE estimate_queue SET ${body.field} = ?, updated_at = datetime('now') WHERE id = ?`).run(body.value || null, body.id);

    // Recompute readiness
    const row = db.prepare("SELECT * FROM estimate_queue WHERE id = ?").get(body.id) as Record<string, unknown>;
    const fileCount = (db.prepare("SELECT COUNT(*) as c FROM estimate_files WHERE estimate_queue_id = ?").get(body.id) as { c: number }).c;
    const { status, missing_fields } = computeReadiness(row, fileCount);
    if (row.status === "draft" || row.status === "ready") {
      db.prepare("UPDATE estimate_queue SET status = ?, missing_fields = ? WHERE id = ?").run(status, missing_fields, body.id);
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const { id } = await request.json();
  const db = getDb();
  db.prepare("DELETE FROM estimate_files WHERE estimate_queue_id = ?").run(id);
  db.prepare("DELETE FROM estimate_queue WHERE id = ?").run(id);
  return Response.json({ ok: true });
}
