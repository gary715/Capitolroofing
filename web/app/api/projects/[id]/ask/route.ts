/**
 * Project-specific Maxwell endpoint.
 * Answers questions about a specific active job — area material lists,
 * daily planning, sequencing questions, spec lookups.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { question, image_base64, image_type } = body as {
      question: string;
      image_base64?: string;
      image_type?: string;
    };

    // Load project context
    const jobDir = join(process.cwd(), "..", "jobs", "active", id);
    let projectContext = "";
    let specSummary = "";

    try {
      projectContext = readFileSync(join(jobDir, "project.json"), "utf-8");
    } catch { /* ok */ }
    try {
      specSummary = readFileSync(join(jobDir, "spec_summary.md"), "utf-8");
    } catch { /* ok */ }

    // Load recent log entries for context
    const db = getDb();
    const recentLog = db.prepare(`
      SELECT log_date, area_worked, squares_completed, work_description
      FROM daily_log WHERE project_id = ? ORDER BY log_date DESC LIMIT 5
    `).all(id) as Array<{ log_date: string; area_worked: string; squares_completed: number; work_description: string }>;

    const systemPrompt = `You are Maxwell, the Capitol Roofing operations manager. You are answering a question about a specific active job.

## Project Data
${projectContext}

## Full Spec Summary
${specSummary}

## Recent Daily Log (last 5 entries)
${recentLog.length > 0 ? recentLog.map(e => `${e.log_date}: ${e.area_worked} — ${e.squares_completed ?? '?'} sq — ${e.work_description}`).join('\n') : 'No log entries yet.'}

---

## Your job
Answer the foreman's question clearly and practically. If they upload a photo of a roof section, estimate materials needed for that area using the project spec. Always reference:
- GAF TPO fully adhered system
- Tapered ISO at 1/8" per foot, 4x4 panels, EnergyGuard
- 1/2" HD cover board over ISO, adhered
- Vapor barrier under ISO
- All quantities in sq (100 SF), LF, or unit counts as appropriate

If asked for a material list for an area, format it as a clean table with: Item | Qty | Unit | Notes`;

    const userContent: Anthropic.MessageParam["content"] = [];

    if (image_base64 && image_type) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: image_type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: image_base64,
        },
      });
    }

    userContent.push({ type: "text", text: question });

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    return Response.json({ reply });
  } catch (err) {
    console.error("Project ask error:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
