import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const db = getDb();
  const sessions = db
    .prepare("SELECT * FROM training_sessions ORDER BY created_at DESC")
    .all();
  return Response.json(sessions);
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  const result = db
    .prepare(
      "INSERT INTO training_sessions (topic, status) VALUES (?, 'active')"
    )
    .run(body.topic ?? "Training Session");

  return Response.json({ ok: true, id: result.lastInsertRowid });
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const db = getDb();

  if (body.id && body.messages !== undefined) {
    db.prepare(
      "UPDATE training_sessions SET messages = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(JSON.stringify(body.messages), body.id);
  }
  if (body.id && body.status) {
    db.prepare(
      "UPDATE training_sessions SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(body.status, body.id);
  }
  if (body.id && body.rules_created !== undefined) {
    db.prepare(
      "UPDATE training_sessions SET rules_created = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(body.rules_created, body.id);
  }
  if (body.id && body.documents_processed) {
    db.prepare(
      "UPDATE training_sessions SET documents_processed = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(JSON.stringify(body.documents_processed), body.id);
  }

  return Response.json({ ok: true });
}
