import { NextRequest } from "next/server";
import { getDb, type EstimateStatus } from "@/lib/db";
import { requireRole } from "@/lib/authorize";

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const db = getDb();
  const estimates = db.prepare(`
    SELECT id, customer_name, job_address, job_type, squares, total, status, flags, created_at
    FROM estimates
    ORDER BY created_at DESC
  `).all();
  return Response.json(estimates);
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  const body = await request.json();
  const { id, status, lost_reason } = body as {
    id: number;
    status: EstimateStatus;
    lost_reason?: string;
  };

  const db = getDb();
  db.prepare(`
    UPDATE estimates SET status = ?, lost_reason = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, lost_reason ?? null, id);

  return Response.json({ ok: true });
}
