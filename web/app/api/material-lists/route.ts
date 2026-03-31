import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const lists = db.prepare(`
    SELECT ml.id, ml.job_address, ml.status, ml.flags, ml.created_at,
           e.customer_name, e.job_address as estimate_address
    FROM material_lists ml
    LEFT JOIN estimates e ON ml.estimate_id = e.id
    ORDER BY ml.created_at DESC
  `).all();
  return Response.json(lists);
}
