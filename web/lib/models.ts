/**
 * Model selection config — maps each task type to its recommended model.
 *
 * Cost per 1M tokens (as of 2025):
 *   Haiku 4.5:  $0.80 input / $4.00 output
 *   Sonnet 4.6: $3.00 input / $15.00 output
 *   Opus 4.6:   $15.00 input / $75.00 output
 */

export type ModelTier = "haiku" | "sonnet" | "opus";

export interface ModelConfig {
  model: string;
  tier: ModelTier;
  maxTokens: number;
  description: string;
  costPer1MInput: number;
  costPer1MOutput: number;
}

const MODELS: Record<ModelTier, ModelConfig> = {
  haiku: {
    model: "claude-haiku-4-5-20251001",
    tier: "haiku",
    maxTokens: 1024,
    description: "Fast + cheap — routing, classification, simple lookups",
    costPer1MInput: 0.80,
    costPer1MOutput: 4.00,
  },
  sonnet: {
    model: "claude-sonnet-4-6",
    tier: "sonnet",
    maxTokens: 2048,
    description: "Balanced — estimates, material lists, photo analysis",
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
  },
  opus: {
    model: "claude-opus-4-6",
    tier: "opus",
    maxTokens: 4096,
    description: "Most capable — complex training, rule extraction, PDF analysis",
    costPer1MInput: 15.00,
    costPer1MOutput: 75.00,
  },
};

export interface TaskModelMapping {
  task: string;
  recommendedTier: ModelTier;
  reason: string;
}

export const TASK_MODELS: TaskModelMapping[] = [
  { task: "document_routing", recommendedTier: "haiku", reason: "Simple classification — determine doc type from text" },
  { task: "help_chat", recommendedTier: "haiku", reason: "Answering employee questions about the dashboard" },
  { task: "estimate_generation", recommendedTier: "sonnet", reason: "Structured output with material lists and quantities" },
  { task: "material_list", recommendedTier: "sonnet", reason: "Parsing walkthrough notes into item lists" },
  { task: "photo_analysis", recommendedTier: "sonnet", reason: "Analyzing roof photos for material estimation" },
  { task: "project_qa", recommendedTier: "sonnet", reason: "Answering project-specific questions with context" },
  { task: "pdf_parsing", recommendedTier: "sonnet", reason: "Extracting specs and data from PDF documents" },
  { task: "training_qa", recommendedTier: "opus", reason: "Learning new rules — needs deep reasoning to extract patterns" },
  { task: "rule_extraction", recommendedTier: "opus", reason: "Analyzing Q&A sessions to formulate precise rules" },
  { task: "estimate_review", recommendedTier: "opus", reason: "QA review of generated estimates before sending" },
];

export function getModelForTask(task: string): ModelConfig {
  const mapping = TASK_MODELS.find((t) => t.task === task);
  const tier = mapping?.recommendedTier ?? "sonnet";
  return MODELS[tier];
}

export function getModelByTier(tier: ModelTier): ModelConfig {
  return MODELS[tier];
}

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  tier: ModelTier
): number {
  const m = MODELS[tier];
  return (
    (inputTokens / 1_000_000) * m.costPer1MInput +
    (outputTokens / 1_000_000) * m.costPer1MOutput
  );
}

export { MODELS };
