import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.role) {
    const validRoles = ["admin", "estimator", "foreman", "viewer"];
    if (!validRoles.includes(body.role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.push("role = ?");
    values.push(body.role);
  }
  if (body.password) {
    if (body.password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    updates.push("password_hash = ?");
    values.push(bcrypt.hashSync(body.password, 10));
  }

  if (updates.length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  return Response.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  // Cannot delete yourself
  if (session?.user?.id === id) {
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return Response.json({ ok: true });
}
