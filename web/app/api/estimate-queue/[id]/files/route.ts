import { getDb } from "@/lib/db";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/authorize";
import { validateUpload } from "@/lib/upload-validate";

const QUEUE_DIR = join(process.cwd(), "..", "data", "estimate-queue");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const { id } = await params;
  const db = getDb();
  const files = db.prepare("SELECT * FROM estimate_files WHERE estimate_queue_id = ? ORDER BY created_at DESC").all(id);
  return Response.json(files);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "other";

  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  const check = validateUpload(file);
  if (!check.valid) return Response.json({ error: check.error }, { status: 400 });

  const dir = join(QUEUE_DIR, id);
  mkdirSync(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = join(dir, file.name);
  writeFileSync(filePath, buffer);

  const db = getDb();
  db.prepare(`
    INSERT INTO estimate_files (estimate_queue_id, file_name, file_category, file_path)
    VALUES (?, ?, ?, ?)
  `).run(id, file.name, category, filePath);

  // Recompute readiness
  const REQUIRED = ["name", "address", "roofing_type", "insulation_type"];
  const row = db.prepare("SELECT * FROM estimate_queue WHERE id = ?").get(id) as Record<string, unknown>;
  const fileCount = (db.prepare("SELECT COUNT(*) as c FROM estimate_files WHERE estimate_queue_id = ?").get(id) as { c: number }).c;

  const missing: string[] = [];
  for (const f of REQUIRED) {
    if (!row[f]) missing.push(f);
  }
  if (fileCount === 0) missing.push("satellite image");

  const status = missing.length === 0 ? "ready" : "draft";
  if (row.status === "draft" || row.status === "ready") {
    db.prepare("UPDATE estimate_queue SET status = ?, missing_fields = ? WHERE id = ?").run(status, JSON.stringify(missing), id);
  }

  return Response.json({ ok: true, name: file.name });
}

/** Serve a file by name for preview */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const { id } = await params;
  const { fileId } = await request.json();
  const db = getDb();
  db.prepare("DELETE FROM estimate_files WHERE id = ? AND estimate_queue_id = ?").run(fileId, id);
  return Response.json({ ok: true });
}
