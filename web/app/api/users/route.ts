import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireRole("admin");
  if (error) return error;

  const db = getDb();
  const users = db
    .prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC")
    .all();
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name) {
    return Response.json({ error: "email, password, and name are required" }, { status: 400 });
  }

  const validRoles = ["admin", "estimator", "foreman", "viewer"];
  if (role && !validRoles.includes(role)) {
    return Response.json({ error: `role must be one of: ${validRoles.join(", ")}` }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return Response.json({ error: "Email already exists" }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    .run(email, hash, name, role ?? "viewer");

  return Response.json({ ok: true, id: result.lastInsertRowid });
}
