/**
 * Project Helper — Maxwell chat endpoint.
 * Loads all text reference files from data/project-helper/references/ as context,
 * then answers the question. Supports optional image or PDF attachment.
 */

import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const REF_DIR = join(process.cwd(), "..", "data", "project-helper", "references");

function loadReferenceContext(): string {
  try {
    mkdirSync(REF_DIR, { recursive: true });
    const files = readdirSync(REF_DIR);
    const sections: string[] = [];
    for (const f of files) {
      if (f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json")) {
        try {
          const content = readFileSync(join(REF_DIR, f), "utf-8");
          sections.push(`### ${f}\n${content}`);
        } catch { /* skip unreadable */ }
      }
    }
    return sections.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, file_base64, file_type, file_name } = body as {
      question: string;
      file_base64?: string;
      file_type?: string;
      file_name?: string;
    };

    const referenceContext = loadReferenceContext();

    const systemPrompt = `You are Maxwell, the Capitol Roofing operations assistant. You answer questions about roofing projects, materials, specs, estimating, and sequencing.

${referenceContext ? `## Reference Files\n${referenceContext}` : "## Reference Files\n(No reference files loaded yet — answers are based on general roofing knowledge.)"}

---

Answer questions clearly and practically. When giving material quantities use sq (100 SF), LF, or unit counts as appropriate. Format material lists as tables (Item | Qty | Unit | Notes) when helpful. Reference the loaded specs when relevant.`;

    const userContent: Anthropic.MessageParam["content"] = [];

    if (file_base64 && file_type) {
      if (file_type.startsWith("image/")) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: file_type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: file_base64,
          },
        });
      } else if (file_type === "application/pdf") {
        // Claude supports PDF documents natively
        userContent.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: file_base64,
          },
        } as unknown as Anthropic.TextBlockParam);
        if (file_name) {
          userContent.push({ type: "text", text: `The above is the file "${file_name}".` });
        }
      }
    }

    userContent.push({
      type: "text",
      text: question || "Please summarize or describe this file.",
    });

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
    console.error("Project helper ask error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
