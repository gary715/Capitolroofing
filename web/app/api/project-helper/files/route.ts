import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

const REF_DIR = join(process.cwd(), "..", "data", "project-helper", "references");

export async function GET() {
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
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });

    mkdirSync(REF_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(REF_DIR, file.name), buffer);
    return Response.json({ ok: true, name: file.name });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}
