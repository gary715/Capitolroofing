/**
 * Help API — answers questions from human employees about the system.
 *
 * This is the only user-facing chat interface. It knows the full dashboard,
 * workflow, and where to upload every type of document.
 *
 * Instructions are maintained in data/help/dashboard_instructions.md
 * That file is updated by Casey (Workflow Engineer) whenever the dashboard changes.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/authorize";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function loadInstructions(): string {
  const dataDir = join(process.cwd(), "..", "data");

  // Try the dedicated help instructions file first, fall back to workflow
  const files = [
    join(dataDir, "help", "dashboard_instructions.md"),
    join(dataDir, "rules", "workflow.md"),
  ];

  const sections: string[] = [];
  for (const f of files) {
    try {
      sections.push(readFileSync(f, "utf-8"));
    } catch {
      // skip missing
    }
  }
  return sections.join("\n\n---\n\n");
}

const SYSTEM_PROMPT = `You are a helpful assistant for Capitol Roofing employees. You know exactly how the automation system works and can answer any question about it clearly and concisely.

You are NOT a roofing expert — you are a system guide. Your job is to tell employees:
- Where to upload specific documents
- What each section of the dashboard does
- What happens after a document is processed
- How the estimate and material list workflow works
- What Maxwell does and what the AI does in the background

## System Overview

${loadInstructions()}

## Dashboard Sections

**Estimates**
- Upload walkthrough notes (field photos, hand-drawn sketches, work orders, handwritten notes) here
- Maxwell receives the document, parses it, and generates a draft estimate
- Each estimate has a status: Open → Sent → Won or Lost
- Won estimates move to Phase 2 (material list)
- All estimates are stored so you can track conversion rate

**Material Lists**
- Upload here AFTER a contract is signed and the final field visit / walkthrough is done
- Upload the handwritten material sheet from the field visit
- Maxwell parses it and generates the crew pull list
- Print the list from this section when the job is coming up

**Active Jobs**
- Jobs with signed contracts that are in progress
- Coming soon

**Products**
- IB Roof Systems PVC product catalog — 148 items
- Reference for product names, units, and specifications

**Rules & Docs**
- Estimating rules, derived materials rules, abbreviation legend
- These are the rules Maxwell uses when processing documents

**Team**
- View each AI team member and their current task
- Maxwell is the manager — he routes all uploaded documents

**Help (this section)**
- Ask any question about the system
- Instructions are updated by Casey whenever the dashboard changes

## Key Rules
- Never upload the same document to multiple sections — Maxwell will route it correctly based on which section you upload to
- If you're unsure what type a document is, upload it to Estimates — Maxwell will determine the type
- Estimates are never deleted — even if lost, they stay for reporting
- The system flags anything it can't figure out — the boss resolves flags before finalizing

Keep answers short and practical. If someone asks where to upload something, tell them exactly which section and what will happen.`;

export async function POST(request: NextRequest) {
  const { error, session } = await requireRole("viewer");
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
    const { message, history = [] } = body as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...history,
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    return Response.json({ reply });
  } catch (err) {
    console.error("Help API error:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
