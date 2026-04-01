/**
 * Training chat endpoint.
 *
 * This is different from project-helper/ask — it's designed to LEARN.
 * When the user provides information, Maxwell extracts rules and stores them.
 * When Maxwell encounters unknowns, it asks specific questions.
 *
 * Uses Opus for training (deep reasoning for rule extraction).
 * Falls back gracefully when API key is not configured.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readdirSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { checkRateLimit } from "@/lib/rate-limit";
import { getModelForTask } from "@/lib/models";

const REF_DIR = join(process.cwd(), "..", "data", "project-helper", "references");

function loadRules(db: ReturnType<typeof getDb>): string {
  const rules = db
    .prepare(
      "SELECT category, subcategory, rule_text, confidence FROM training_rules ORDER BY category, subcategory"
    )
    .all() as Array<{
    category: string;
    subcategory: string | null;
    rule_text: string;
    confidence: string;
  }>;

  if (rules.length === 0) return "(No rules learned yet)";

  const grouped: Record<string, string[]> = {};
  for (const r of rules) {
    const key = r.subcategory
      ? `${r.category} > ${r.subcategory}`
      : r.category;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(`[${r.confidence}] ${r.rule_text}`);
  }

  return Object.entries(grouped)
    .map(([cat, items]) => `### ${cat}\n${items.join("\n")}`)
    .join("\n\n");
}

function loadReferences(): string {
  try {
    mkdirSync(REF_DIR, { recursive: true });
    const files = readdirSync(REF_DIR);
    const sections: string[] = [];
    for (const f of files) {
      if (f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json")) {
        try {
          sections.push(
            `### ${f}\n${readFileSync(join(REF_DIR, f), "utf-8")}`
          );
        } catch {
          /* skip */
        }
      }
    }
    return sections.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireRole("estimator");
  if (error) return error;
  const limit = checkRateLimit(session!.user.id);
  if (!limit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const {
      question,
      session_id,
      file_base64,
      file_type,
      file_name,
      conversation,
    } = body as {
      question: string;
      session_id?: number;
      file_base64?: string;
      file_type?: string;
      file_name?: string;
      conversation?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({
        reply:
          "API key not configured yet. The training infrastructure is ready — add ANTHROPIC_API_KEY to web/.env.local to activate.",
        rules_extracted: [],
        questions: [],
        model_used: "none",
        tokens: { input: 0, output: 0, cost: 0 },
      });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const db = getDb();
    const modelConfig = getModelForTask("training_qa");
    const rulesContext = loadRules(db);
    const referenceContext = loadReferences();

    const RULE_CATEGORIES = [
      "materials",
      "pricing",
      "labor",
      "measurements",
      "conditions",
      "procedures",
      "vendors",
      "specifications",
      "safety",
      "terminology",
    ];

    const systemPrompt = `You are Maxwell, the Capitol Roofing training assistant. Your job is to LEARN estimating rules from the user and ask questions about things you don't know yet.

## Current Learned Rules
${rulesContext}

## Reference Files
${referenceContext || "(No reference files loaded)"}

## How Training Works
1. The user uploads documents (completed estimates, walkthroughs, specs) or explains how something works
2. You analyze the information and extract RULES — specific, reusable patterns
3. For anything unclear, you ask TARGETED questions
4. Every rule you extract gets stored and used for future estimates

## Rule Categories
${RULE_CATEGORIES.join(", ")}

## Your Response Format
Always respond with valid JSON:
{
  "reply": "Your conversational response to the user — explain what you learned, ask follow-up questions",
  "rules_extracted": [
    {
      "category": "one of: ${RULE_CATEGORIES.join(", ")}",
      "subcategory": "optional subcategory",
      "rule_text": "The specific rule in clear, reusable language",
      "confidence": "learned"
    }
  ],
  "questions": [
    "Specific questions about things not yet covered in the rules"
  ],
  "model_recommendation": "haiku|sonnet|opus — which model would be best for applying this type of rule in production"
}

Rules should be specific and actionable. For example:
- GOOD: "TPO membrane rolls are 10' wide x 100' long. For a 50 SQ roof, order 5 rolls + 10% waste = 6 rolls."
- BAD: "Order enough membrane for the roof."

When the user uploads a completed estimate, compare it against existing rules and identify NEW patterns that aren't captured yet.`;

    const messages: Anthropic.MessageParam[] = [];

    // Include conversation history if provided
    if (conversation && conversation.length > 0) {
      for (const msg of conversation) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build current user message
    const userContent: Anthropic.MessageParam["content"] = [];

    if (file_base64 && file_type) {
      if (file_type.startsWith("image/")) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: file_type as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: file_base64,
          },
        });
      } else if (file_type === "application/pdf") {
        userContent.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: file_base64,
          },
        } as unknown as Anthropic.TextBlockParam);
        if (file_name) {
          userContent.push({
            type: "text",
            text: `[Uploaded: ${file_name}]`,
          });
        }
      }
    }

    userContent.push({
      type: "text",
      text: question || "Analyze this document and extract any estimating rules.",
    });

    messages.push({ role: "user", content: userContent });

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: modelConfig.maxTokens,
      system: systemPrompt,
      messages,
    });

    const replyText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    // Parse structured response
    let parsed: {
      reply: string;
      rules_extracted: Array<{
        category: string;
        subcategory?: string;
        rule_text: string;
        confidence: string;
      }>;
      questions: string[];
      model_recommendation?: string;
    } = { reply: replyText, rules_extracted: [], questions: [] };

    try {
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      /* use raw text as reply */
    }

    // Store extracted rules
    const rulesStored: number[] = [];
    if (parsed.rules_extracted && parsed.rules_extracted.length > 0) {
      for (const rule of parsed.rules_extracted) {
        const result = db
          .prepare(
            `INSERT INTO training_rules (category, subcategory, rule_text, source_session_id, confidence)
             VALUES (?, ?, ?, ?, ?)`
          )
          .run(
            rule.category,
            rule.subcategory ?? null,
            rule.rule_text,
            session_id ?? null,
            rule.confidence ?? "learned"
          );
        rulesStored.push(Number(result.lastInsertRowid));
      }

      // Update session rules count
      if (session_id) {
        db.prepare(
          "UPDATE training_sessions SET rules_created = rules_created + ?, updated_at = datetime('now') WHERE id = ?"
        ).run(parsed.rules_extracted.length, session_id);
      }
    }

    // Log model usage
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const cost =
      (inputTokens / 1_000_000) * modelConfig.costPer1MInput +
      (outputTokens / 1_000_000) * modelConfig.costPer1MOutput;

    db.prepare(
      `INSERT INTO model_usage (task_type, model_used, input_tokens, output_tokens, cost_estimate, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run("training_qa", modelConfig.model, inputTokens, outputTokens, cost, null);

    return Response.json({
      reply: parsed.reply,
      rules_extracted: parsed.rules_extracted,
      rules_stored_ids: rulesStored,
      questions: parsed.questions,
      model_recommendation: parsed.model_recommendation,
      model_used: modelConfig.tier,
      tokens: { input: inputTokens, output: outputTokens, cost: +cost.toFixed(4) },
    });
  } catch (err) {
    console.error("Training ask error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
