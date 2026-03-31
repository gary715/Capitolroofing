# System Workflow — Capitol Roofing Automation

This document defines the end-to-end workflow for how jobs move through the system,
from initial site visit to material list delivery to the crew.

---

## What Is a Walkthrough?

A **walkthrough** is a site visit that takes place approximately 3–4 weeks before the job starts.
The purpose is to take final measurements, photos, and notes so that the exact material list can be built.

A walkthrough typically produces:
1. **Handwritten notes** — abbreviations, quantities, linear feet of metal, penetration counts
2. **A hand-drawn sketch** — roof sections with dimensions and area in squares, drain locations
3. **A work order** (sometimes) — pre-filled document confirming job type, total squares, and labor
4. Photos of the roof, penetrations, and problem areas

All of these are uploaded together as the walkthrough package for a job.

---

## Phase 1 — Estimating

### Step 1: Upload Field Notes to Open Folder
- After the site visit, upload any documents (photos, sketches, notes, PDFs) to the `jobs/open/` folder
- Create a subfolder per job: `jobs/open/[customer-name]/`
- The system monitors this folder and automatically detects new jobs

### Step 2: System Examines the Files
- The system reads all documents in the new job folder
- It parses field notes using the abbreviation legend (`data/abbreviations/legend.md`)
- Missing or unrecognized items are flagged for review
- Derived materials rules are applied automatically (e.g., IB cover strip from metal LF)

### Step 3: Estimate is Created
- The system generates a draft estimate using the estimating rules (`data/rules/estimating_rules.md`)
- All required fields must be present — if any are missing, the estimate is marked **INCOMPLETE**
- Draft estimate is saved to the job folder and displayed in the dashboard

### Step 4: Review and Correct
- Owner reviews the estimate in the dashboard
- Any errors due to missing instructions, ambiguous abbreviations, or incomplete field notes are corrected
- Pricing fields marked `[BOSS TO FILL]` must be completed before the estimate is finalized

### Step 5: Finalize and Download
- Owner approves the estimate
- Final estimate is generated as a downloadable PDF
- Job files are moved from `jobs/open/` to `jobs/completed/[customer-name]/`
- Estimate PDF is saved in the completed folder

---

## Phase 2 — Material List (After Contract Signed)

### Step 6: Contract Signed → Notify the System
- Owner tells the system: "Contract signed for [customer name]"
- System moves job to **active** status

### Step 7: Upload Handwritten Material Sheet PDF
- Owner uploads the handwritten material list PDF to the job folder
- File goes in: `jobs/completed/[customer-name]/field_sheet.pdf`

### Step 8: System Converts to Material List
- System reads the handwritten PDF using OCR
- All abbreviations are resolved using the legend
- Derived materials rules are applied (e.g., cover strip, fasteners, etc.)
- Incomplete items are flagged — the system will NOT guess
- Material list is generated and added to the active job queue

### Step 9: Print for Crew
- When the job is approaching (owner indicates job is coming up), the material list is marked **ready to pull**
- Owner prints the material list from the dashboard
- Crew uses the list to pull material from the warehouse

---

## Folder Structure

```
jobs/
  open/                    ← New jobs waiting for estimates
    [customer-name]/
      field_notes.pdf
      sketch.jpg
      ...
  completed/               ← Finalized estimates and active/past jobs
    [customer-name]/
      estimate.pdf
      field_sheet.pdf      ← Handwritten material sheet (uploaded after contract)
      material_list.pdf    ← Generated material list for crew
      contract.pdf         ← Signed contract (if uploaded)
```

---

## Incomplete Item Rules

When parsing handwritten notes, the following trigger a **flag** (not an error):

1. An abbreviation not in the legend → flag as "unknown abbreviation: [X]"
2. Metal listed without a linear footage → flag as "metal LF missing"
3. Pipe count that seems unusually high (>20) → flag for confirmation
4. Any item that conflicts with another (e.g., both T/O and OVR marked) → flag
5. Missing required estimate fields → list exactly which fields are missing

**Rule:** The system presents all flags to the owner before generating the final estimate or material list. The owner resolves each flag manually.

---

## Material List Format

The material list is generated from the walkthrough notes and follows this structure:
1. **Membrane** — type and squares
2. **Insulation** — type, quantity, dimensions
3. **Metal** — each type with LF
4. **Derived materials** — auto-calculated (e.g., cover strip)
5. **Pipe boots** — by size (A, B, C) and quantity
6. **Penetrations & details** — corners, vents, pitch pockets, etc.
7. **Fasteners & hardware** — screws, plates, barbed plates
8. **Miscellaneous** — wood, unistrut, other

The list is generated with all items. Items with zero quantity are filtered out before printing.
Non-standard items (unusual sizes, special orders) are added as additional line items.

The crew uses this list to pull material from the warehouse.

---

## Suggestions for Future Improvement

The following items should be added as the system matures:

- [ ] Email/text notification when a new job is detected in `jobs/open/`
- [ ] Photo-to-sketch parsing (detect roof shape from uploaded photos)
- [ ] Supplier order generation (send material list directly to supplier)
- [ ] Crew notification when material list is ready to pull
- [ ] Job history and reporting (materials used per job, estimate accuracy)
- [ ] Customer portal for estimate approval and e-signature

---

_Last updated: 2026-03-30_
_Maintained by Maxwell_
