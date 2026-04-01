/**
 * Maxwell — the AI brain behind the routing system.
 *
 * When a document is uploaded to any section, it comes here first.
 * Maxwell reads the document, determines what it is, and returns
 * structured output for the appropriate action.
 *
 * Context tells Maxwell which section the upload came from so it
 * can make a better determination.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function loadRules(): string {
  const dataDir = join(process.cwd(), "..", "data");
  const files = [
    { path: join(dataDir, "rules", "estimating_rules.md"), label: "ESTIMATING RULES" },
    { path: join(dataDir, "rules", "derived_materials_rules.md"), label: "DERIVED MATERIALS RULES" },
    { path: join(dataDir, "abbreviations", "legend.md"), label: "ABBREVIATION LEGEND" },
  ];
  return files
    .map((f) => {
      try {
        return `## ${f.label}\n\n${readFileSync(f.path, "utf-8")}`;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

const MAXWELL_PROMPT = `You are Maxwell, the operations manager for Capitol Roofing — a flat roofing company in the Hoboken, NJ area that uses IB Roof Systems PVC materials.

Your job is to receive documents that have been uploaded to the system, determine what they are, and process them into structured output.

${loadRules()}

---

## How to respond

Always respond with a valid JSON object in this exact structure:

{
  "document_type": "walkthrough_notes" | "material_sheet" | "work_order" | "contract" | "photo" | "unknown",
  "action": "generate_estimate" | "generate_material_list" | "store_contract" | "flag_for_review",
  "routed_to": "estimating" | "material_list" | "jobs" | "review",
  "job_summary": {
    "customer_name": string | null,
    "job_address": string | null,
    "job_type": "tearoff" | "overlay" | null,
    "total_squares": number | null,
    "membrane_type": string | null,
    "start_date": string | null
  },
  "material_list": [
    {
      "category": string,
      "item": string,
      "quantity": number | null,
      "unit": string,
      "derived": boolean,
      "notes": string | null
    }
  ],
  "flags": [
    {
      "code": string,
      "message": string,
      "severity": "info" | "warning" | "blocking"
    }
  ],
  "estimate_draft": {
    "squares": number | null,
    "job_type": string | null,
    "penetrations": number | null,
    "notes": string | null
  } | null,
  "summary": string
}

## Rules
- Never guess at quantities — set quantity to null and add a blocking flag
- Apply derived materials rules automatically (cover strip from perimeter LF, drain liners from drain count, etc.)
- Cover strip: GS and DE metal only, 1 roll per 90 LF (round up)
- Pipe boots are called A-Cone, B-Cone, C-Cone, D-Cone, E-Cone
- Flag any discrepancy between sketch squares and work order squares
- The summary field is a 1–2 sentence plain English description of what you found and what action was taken`;

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
    const { text, filename, context } = body as {
      text: string;
      filename: string;
      context: "estimates" | "material-list" | "upload" | string;
    };

    if (!text?.trim()) {
      return Response.json({ error: "Document text is required" }, { status: 400 });
    }

    const userMessage = `Section: ${context}
Filename: ${filename || "unknown"}

Document contents:
---
${text}
---

Process this document.`;

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: MAXWELL_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const response = await stream.finalMessage();
    const rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    // Parse the JSON response from Maxwell
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Maxwell returned an unexpected format", raw: rawText }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Persist to database based on action
    const db = getDb();
    let savedId: number | null = null;

    if (parsed.action === "generate_estimate" || parsed.action === "generate_material_list") {
      if (context === "estimates" || parsed.action === "generate_estimate") {
        const result = db.prepare(`
          INSERT INTO estimates (customer_name, job_address, job_type, squares, notes, raw_document, parsed_output, flags, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
        `).run(
          parsed.job_summary?.customer_name ?? null,
          parsed.job_summary?.job_address ?? null,
          parsed.job_summary?.job_type ?? null,
          parsed.job_summary?.total_squares ?? null,
          parsed.estimate_draft?.notes ?? null,
          text,
          JSON.stringify(parsed.material_list ?? []),
          JSON.stringify(parsed.flags ?? []),
        );
        savedId = result.lastInsertRowid as number;

        // Log the upload
        db.prepare(`
          INSERT INTO upload_log (filename, section, document_type, routed_to, result_id, result_table)
          VALUES (?, ?, ?, ?, ?, 'estimates')
        `).run(filename, context, parsed.document_type, parsed.routed_to, savedId);
      } else if (context === "material-list" || parsed.action === "generate_material_list") {
        const result = db.prepare(`
          INSERT INTO material_lists (job_address, raw_field_notes, parsed_items, flags, status)
          VALUES (?, ?, ?, ?, 'draft')
        `).run(
          parsed.job_summary?.job_address ?? null,
          text,
          JSON.stringify(parsed.material_list ?? []),
          JSON.stringify(parsed.flags ?? []),
        );
        savedId = result.lastInsertRowid as number;

        db.prepare(`
          INSERT INTO upload_log (filename, section, document_type, routed_to, result_id, result_table)
          VALUES (?, ?, ?, ?, ?, 'material_lists')
        `).run(filename, context, parsed.document_type, parsed.routed_to, savedId);
      }
    }

    return Response.json({ ...parsed, saved_id: savedId });
  } catch (err) {
    console.error("Maxwell error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
