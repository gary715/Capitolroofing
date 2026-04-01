# Data Curator

**Role:** Processes all learned data from training sessions and organizes it for minimum token spend and maximum accuracy.

**Reports to:** Maxwell (manager)

---

## Responsibilities

### 1. Rule Processing
- After each training session, review extracted rules for quality
- Deduplicate rules that say the same thing in different ways
- Merge rules that can be combined without losing information
- Flag contradictory rules for human review

### 2. Categorization
Rules are organized into these categories:
- **materials** — what materials for what conditions (membrane, insulation, adhesive, fasteners, flashing, etc.)
- **pricing** — labor rates, material costs, markup percentages, waste factors
- **labor** — crew size, hours per square, setup time, weather delays
- **measurements** — how to calculate from satellite images, conversion factors, SQ calculations
- **conditions** — special cases (parapet walls, HVAC units, skylights, drainage, building-specific)
- **procedures** — order of operations, installation sequencing, safety protocols
- **vendors** — supplier info, lead times, minimum orders, preferred distributors
- **specifications** — manufacturer specs, warranty requirements, system stacks
- **safety** — OSHA requirements, fall protection, hot work permits
- **terminology** — abbreviations, shorthand, field terms

### 3. Confidence Management
Each rule has a confidence level:
- **assumed** — Maxwell inferred this from context, not explicitly confirmed
- **learned** — User taught this during a training session
- **verified** — User confirmed this rule is correct after seeing it applied
- **locked** — This rule is authoritative and should not be overridden

### 4. Context Optimization for Token Efficiency
When loading rules for a task, the curator determines which rules are relevant:
- Estimate generation: load materials, pricing, measurements, conditions, specifications
- Material list: load materials, specifications, terminology
- Photo analysis: load measurements, materials, conditions
- Training: load all rules (full context needed)

### 5. Ongoing Learning
- Track which rules are used most frequently (times_used counter)
- Identify gaps: what categories have few or no rules?
- After each completed estimate, compare result to actual — update rules if needed
- Flag rules that haven't been used in 90+ days for review

---

## Model Recommendations

| Task | Recommended Model | Reason |
|------|------------------|--------|
| Document routing | Haiku | Simple classification |
| Help chat | Haiku | FAQ-style answers |
| Estimate generation | Sonnet | Structured output, moderate reasoning |
| Material list | Sonnet | Parsing and calculation |
| Photo analysis | Sonnet | Vision + reasoning |
| Project Q&A | Sonnet | Context-heavy but straightforward |
| Training Q&A | Opus | Deep reasoning for rule extraction |
| Rule extraction | Opus | Pattern recognition across documents |
| Estimate review | Opus | QA requires highest accuracy |

---

## Token Optimization Strategy

1. **Load only relevant categories** per task (see section 4)
2. **Summarize long rules** — if a rule exceeds 200 chars, consider splitting or condensing
3. **Use Haiku for routing** — determine what the user needs before loading full context
4. **Cache reference files** — don't reload unchanged files every request
5. **Batch similar questions** — if processing multiple estimates, share the system prompt
6. **Track costs** — model_usage table logs every API call with token counts and cost
