import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/authorize";
import { validateUpload } from "@/lib/upload-validate";

const REF_DIR = join(process.cwd(), "..", "data", "project-helper", "references");

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  try {
    mkdirSync(REF_DIR, { recursive: true });
    const files = readdirSync(REF_DIR).map((name) => {
      const stat = statSync(join(REF_DIR, name));
      return { name, size: stat.size };
    });
    return Response.json(files);
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole("estimator");
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });
    const check = validateUpload(file);
    if (!check.valid) return Response.json({ error: check.error }, { status: 400 });

    mkdirSync(REF_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(REF_DIR, file.name), buffer);
    return Response.json({ ok: true, name: file.name });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}
