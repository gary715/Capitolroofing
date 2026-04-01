import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

const RULES_DIR = join(process.cwd(), "..", "data", "rules");

export interface RuleFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  content: string;
}

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("file");

  try {
    const files = readdirSync(RULES_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json"))
      .map((name) => {
        const fullPath = join(RULES_DIR, name);
        const stat = statSync(fullPath);
        return {
          name,
          path: `data/rules/${name}`,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // If a specific file is requested, return its content
    if (fileName) {
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
      const fullPath = join(RULES_DIR, safeName);
      try {
        const content = readFileSync(fullPath, "utf-8");
        return Response.json({ name: safeName, content });
      } catch {
        return Response.json({ error: "File not found" }, { status: 404 });
      }
    }

    return Response.json(files);
  } catch {
    return Response.json([]);
  }
}

export async function PUT(request: NextRequest) {
  // Future: allow editing rule files from the UI
  const body = await request.json();
  const { name, content } = body as { name: string; content: string };

  if (!name || !content) {
    return Response.json({ error: "name and content required" }, { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "");
  const fullPath = join(RULES_DIR, safeName);

  try {
    const { writeFileSync } = await import("fs");
    writeFileSync(fullPath, content, "utf-8");
    return Response.json({ ok: true, name: safeName });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Write failed" },
      { status: 500 }
    );
  }
}
