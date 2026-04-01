import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const db = getDb();
  const rules = db
    .prepare(
      "SELECT * FROM training_rules ORDER BY category, subcategory, created_at DESC"
    )
    .all();
  return Response.json(rules);
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  const result = db
    .prepare(
      `INSERT INTO training_rules (category, subcategory, rule_text, source_document, source_session_id, confidence)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      body.category,
      body.subcategory ?? null,
      body.rule_text,
      body.source_document ?? null,
      body.source_session_id ?? null,
      body.confidence ?? "learned"
    );

  return Response.json({ ok: true, id: result.lastInsertRowid });
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  if (body.id && body.confidence) {
    db.prepare(
      "UPDATE training_rules SET confidence = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(body.confidence, body.id);
    return Response.json({ ok: true });
  }

  if (body.id && body.rule_text) {
    db.prepare(
      "UPDATE training_rules SET rule_text = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(body.rule_text, body.id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await request.json();
  const db = getDb();
  db.prepare("DELETE FROM training_rules WHERE id = ?").run(id);
  return Response.json({ ok: true });
}
