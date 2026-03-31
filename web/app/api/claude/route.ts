import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Load reference docs from the data directory
function loadSystemContext(): string {
  const dataDir = join(process.cwd(), "..", "data");
  const files = [
    { path: join(dataDir, "rules", "estimating_rules.md"), label: "ESTIMATING RULES" },
    { path: join(dataDir, "rules", "derived_materials_rules.md"), label: "DERIVED MATERIALS RULES" },
    { path: join(dataDir, "abbreviations", "legend.md"), label: "ABBREVIATION LEGEND" },
    { path: join(dataDir, "rules", "workflow.md"), label: "WORKFLOW" },
  ];

  const sections: string[] = [];
  for (const file of files) {
    try {
      const content = readFileSync(file.path, "utf-8");
      sections.push(`## ${file.label}\n\n${content}`);
    } catch {
      // Skip missing files
    }
  }

  return sections.join("\n\n---\n\n");
}

const SYSTEM_PROMPT = `You are the Capitol Roofing automation assistant. You help generate material lists and estimates for flat roofing jobs using IB Roof Systems PVC materials.

You have access to the following reference documents:

${loadSystemContext()}

## Your Job

When given field notes, a walkthrough description, or a parsed job file, you:
1. Parse all items using the abbreviation legend
2. Apply derived materials rules automatically (cover strip from perimeter metal LF, etc.)
3. Flag any missing quantities, unknown abbreviations, or discrepancies
4. Generate a complete structured material list

## Output Format

Always respond with a structured material list in this order:
1. Job Summary (address, job type, membrane type, total squares)
2. Insulation
3. Membrane
4. Metal (with LF for each type)
5. Derived Materials (auto-calculated — show your work)
6. Pipe Boots / Cones
7. Penetrations & Details
8. Fasteners & Hardware
9. Drains
10. Gutters & Leaders
11. Wood
12. Skylights (if any)
13. Miscellaneous
14. FLAGS — list every open question that must be resolved before finalizing

## Rules
- Never guess at a quantity — flag it instead
- Cover strip ONLY applies to GS and DE perimeter metal (not separator, service, or term metal)
- Pipe boots use cone names: A-Cone, B-Cone, C-Cone, D-Cone, E-Cone
- If squares from sketch and work order disagree, flag it
- Metal without LF = flag it, do not estimate
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Build message array from history + new message
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...history,
      { role: "user", content: message },
    ];

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages,
    });

    const response = await stream.finalMessage();
    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    return Response.json({
      reply: textContent,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("Claude API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
