import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/authorize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const { id } = await params;
  const db = getDb();
  const entries = db.prepare(`
    SELECT * FROM deliveries WHERE project_id = ? ORDER BY delivery_date DESC, created_at DESC
  `).all(id);
  return Response.json(entries);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("foreman");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO deliveries (project_id, delivery_date, type, description, supplier, quantity, dumpster_number, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.delivery_date ?? new Date().toISOString().slice(0, 10),
    body.type,
    body.description ?? null,
    body.supplier ?? null,
    body.quantity ?? null,
    body.dumpster_number ?? null,
    body.notes ?? null,
  );

  return Response.json({ ok: true, id: result.lastInsertRowid });
}
