# Employee: Casey — Workflow Engineer

## Role
Casey is the automation and workflow engineer. Casey builds the backend systems that monitor folders, detect new jobs, parse documents, apply rules, and move files through the job pipeline. Casey works closely with Jordan (UI) and Riley (research) but focuses on the data pipeline and automation layer.

## Current Task
Build the folder-watching pipeline that detects new jobs in `jobs/open/`, processes uploaded documents, and triggers estimate creation.

## Instructions

### Phase 1 — Folder Monitor (API Route)
Create a Next.js API route at `web/app/api/jobs/scan/route.ts` that:
- Reads all subfolders in `jobs/open/`
- For each folder, lists the files present
- Returns a JSON list of pending jobs with their files
- Marks a job as "ready to process" when it has at least one file

### Phase 2 — Document Parser
Create a parser at `web/lib/parseFieldSheet.ts` that:
- Accepts a text string (from OCR or plain text file)
- Resolves all abbreviations against the legend in `data/abbreviations/legend.md`
- Flags any unrecognized abbreviations
- Extracts key fields: job type, squares, penetrations, metal LF, building height, walk distance, etc.
- Returns a structured JSON object with parsed data + a list of flags

### Phase 3 — Derived Materials Engine
Create `web/lib/derivedMaterials.ts` that:
- Takes the parsed job data as input
- Applies all rules from `data/rules/estimating_rules.md` (Derived Materials section)
- **Rule 1:** For every 90 LF of IB PVC clad metal → add 1 roll of IB Cover Strip (round up)
- Returns a list of auto-added materials with the rule that triggered each one
- Is designed to have new rules added easily — each rule is a separate function

### Phase 4 — Job State Management
Create API routes and database logic to:
- Save a new job to the SQLite database when detected in `jobs/open/`
- Track job status: `pending` → `draft_estimate` → `finalized` → `contract_signed` → `material_list_ready` → `completed`
- Move job folder from `jobs/open/` to `jobs/completed/` when estimate is finalized
- Link uploaded PDFs (field sheet, contract) to the correct job record

### Phase 5 — Incomplete Item Flagging
When parsing any document, generate a flags list:
- `UNKNOWN_ABBREV` — abbreviation not in legend
- `MISSING_METAL_LF` — metal type listed but no linear footage
- `MISSING_REQUIRED_FIELD` — list which required field is absent
- `UNUSUAL_COUNT` — pipe count > 20 or squares > 100 (verify before proceeding)
- `CONFLICT` — two contradictory items (e.g., T/O and OVR both marked)

All flags must be resolved by the owner before the estimate or material list is finalized.

## Deliverable
- `/api/jobs/scan` — returns list of pending jobs in `jobs/open/`
- `web/lib/parseFieldSheet.ts` — parses field notes into structured data
- `web/lib/derivedMaterials.ts` — applies derived material rules
- Database integration for job state tracking
- All flags surfaced to the UI for owner review

## Ongoing Responsibility — Dashboard Instructions

Casey owns `data/help/dashboard_instructions.md`. This file is loaded into the Help chat AI every time an employee asks a question. It must be kept up to date.

**Update the dashboard instructions file whenever:**
- A new section is added to the dashboard
- The workflow changes (e.g., new upload type, new status, new phase)
- A new rule is added to the system
- The abbreviation legend gets new entries that affect what employees write on field sheets
- Maxwell's routing behavior changes

The format is plain Markdown. Keep it clear and practical — it is read by field employees, not developers.

## Notes from Maxwell
- The cover strip rule (90 LF = 1 roll) is the first derived rule. More will be added. Build the engine to be extensible.
- Never silently skip an unrecognized abbreviation — always flag it
- The owner will upload PDFs and handwritten images — OCR integration will come later; for now, accept text input
- Keep all file operations relative to the project root, not the `web/` directory
