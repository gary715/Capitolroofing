/**
 * Process estimate queue items.
 * Sends each estimate's data + files + reference catalog to Maxwell,
 * which generates a structured estimate with material lists and flags.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const REF_DIR = join(process.cwd(), "..", "data", "project-helper", "references");

function loadReferences(): string {
  try {
    mkdirSync(REF_DIR, { recursive: true });
    const files = readdirSync(REF_DIR);
    const sections: string[] = [];
    for (const f of files) {
      if (f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json")) {
        try {
          sections.push(`### ${f}\n${readFileSync(join(REF_DIR, f), "utf-8")}`);
        } catch { /* skip */ }
      }
    }
    return sections.join("\n\n---\n\n");
  } catch { return ""; }
}

interface QueueItem {
  id: number;
  name: string;
  address: string | null;
  roofing_type: string | null;
  insulation_type: string | null;
  total_squares: number | null;
  stories: number | null;
  notes: string | null;
  status: string;
}

interface FileRecord {
  id: number;
  file_name: string;
  file_category: string;
  file_path: string;
}

async function processOne(item: QueueItem, db: ReturnType<typeof getDb>) {
  const files = db.prepare("SELECT * FROM estimate_files WHERE estimate_queue_id = ?").all(item.id) as FileRecord[];

  // Build user content with images
  const userContent: Anthropic.MessageParam["content"] = [];

  for (const f of files) {
    try {
      const data = readFileSync(f.file_path);
      const ext = f.file_name.split(".").pop()?.toLowerCase();

      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? "")) {
        const mediaType = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
          : ext === "png" ? "image/png"
          : ext === "gif" ? "image/gif"
          : "image/webp";
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: data.toString("base64"),
          },
        });
        userContent.push({ type: "text", text: `[Above: ${f.file_category} — ${f.file_name}]` });
      } else if (ext === "pdf") {
        userContent.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: data.toString("base64"),
          },
        } as unknown as Anthropic.TextBlockParam);
        userContent.push({ type: "text", text: `[Above: ${f.file_category} — ${f.file_name}]` });
      }
    } catch { /* skip unreadable files */ }
  }

  const projectInfo = `
Job: ${item.name}
Address: ${item.address ?? "Not provided"}
Roofing Type: ${item.roofing_type ?? "Not specified"}
Insulation: ${item.insulation_type ?? "Not specified"}
Total Squares: ${item.total_squares ?? "Unknown"}
Stories: ${item.stories ?? "Unknown"}
Notes: ${item.notes ?? "None"}
Files attached: ${files.map(f => `${f.file_name} (${f.file_category})`).join(", ") || "None"}
  `.trim();

  userContent.push({
    type: "text",
    text: `Generate a complete roofing estimate for this project:\n\n${projectInfo}\n\nUse the reference files and uploaded images to create the most accurate estimate possible. If you are unsure about something, include it in the "questions" array.`,
  });

  const referenceContext = loadReferences();

  const systemPrompt = `You are Maxwell, the Capitol Roofing estimating AI. Generate structured roofing estimates.

## Reference Materials
${referenceContext || "(No reference files loaded)"}

## Your Task
Generate a complete estimate. Return ONLY valid JSON with this structure:
{
  "summary": "Brief project summary",
  "total_squares": <number>,
  "material_list": [
    { "item": "Item name", "quantity": <number>, "unit": "sq/LF/EA/rolls", "notes": "optional" }
  ],
  "flags": [
    { "severity": "blocking|warning|info", "message": "Description of concern" }
  ],
  "questions": [
    "Question about something uncertain — answering this will improve future estimates"
  ],
  "estimated_labor_days": <number or null>,
  "notes": "Any additional notes or assumptions"
}

Be thorough with materials. Include membrane, insulation, adhesives, fasteners, cover board, flashing, drains, pipe boots, term bar, caulk, etc. Use the abbreviation legend and derived materials rules when applicable.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const reply = response.content
    .filter(b => b.type === "text")
    .map(b => (b as Anthropic.TextBlock).text)
    .join("");

  // Try to parse JSON from the response
  let result = reply;
  let questions: string | null = null;
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = JSON.stringify(parsed, null, 2);
      if (parsed.questions && parsed.questions.length > 0) {
        questions = JSON.stringify(parsed.questions);
      }
    }
  } catch { /* store raw if JSON parse fails */ }

  return { result, questions };
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireRole("estimator");
  if (error) return error;
  const limit = checkRateLimit(session!.user.id);
  if (!limit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { ids, force } = body as { ids?: number[]; force?: boolean };

    const db = getDb();

    let items: QueueItem[];
    if (ids && ids.length > 0) {
      items = ids.map(id => db.prepare("SELECT * FROM estimate_queue WHERE id = ?").get(id) as QueueItem).filter(Boolean);
    } else if (force) {
      items = db.prepare("SELECT * FROM estimate_queue WHERE status IN ('draft', 'ready')").all() as QueueItem[];
    } else {
      items = db.prepare("SELECT * FROM estimate_queue WHERE status = 'ready'").all() as QueueItem[];
    }

    if (items.length === 0) {
      return Response.json({ error: "No estimates to process", count: 0 }, { status: 400 });
    }

    const results: Array<{ id: number; name: string; success: boolean; error?: string }> = [];

    for (const item of items) {
      db.prepare("UPDATE estimate_queue SET status = 'processing', updated_at = datetime('now') WHERE id = ?").run(item.id);

      try {
        const { result, questions } = await processOne(item, db);
        db.prepare("UPDATE estimate_queue SET status = 'complete', result = ?, questions = ?, updated_at = datetime('now') WHERE id = ?")
          .run(result, questions, item.id);
        results.push({ id: item.id, name: item.name, success: true });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Processing failed";
        db.prepare("UPDATE estimate_queue SET status = 'error', result = ?, updated_at = datetime('now') WHERE id = ?")
          .run(errMsg, item.id);
        results.push({ id: item.id, name: item.name, success: false, error: errMsg });
      }
    }

    return Response.json({ ok: true, processed: results });
  } catch (err) {
    console.error("Process queue error:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
