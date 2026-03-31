# Dashboard Instructions — Capitol Roofing Automation System

This document is the source of truth for the Help chat. It is loaded into the Help AI every time an employee asks a question.
**This file must be updated by Casey (Workflow Engineer) whenever the dashboard changes.**

---

## What This System Does

The Capitol Roofing automation system takes documents from the field — handwritten notes, sketches, work orders, PDFs — and automatically converts them into estimates and material lists. It also tracks every estimate so we know our conversion rate (how many estimates turn into contracts).

The AI behind the system is called **Maxwell**. He reads every uploaded document, figures out what it is, and routes it to the right process.

---

## The Two Phases

### Phase 1 — Estimate
1. Do the site visit / walkthrough (3–4 weeks before the job)
2. Take measurements, photos, notes, and sketches
3. Upload everything to the **Estimates** section
4. Maxwell parses the documents and creates a draft estimate
5. Review the estimate — resolve any flags Maxwell raised
6. Mark the estimate as **Won** (contract signed) or **Lost** (didn't get the job)

### Phase 2 — Material List
1. Only starts after an estimate is marked **Won**
2. Do the final field visit before the job starts
3. Fill out the handwritten material sheet on the field
4. Upload the handwritten sheet to the **Material Lists** section
5. Maxwell converts it into a complete crew pull list
6. Print the list when the job is coming up — crew uses it to pull from warehouse

---

## Where to Upload Each Document

| Document | Upload to | What Maxwell does |
|---|---|---|
| Walkthrough photos | Estimates | Parses measurements, generates draft estimate |
| Handwritten field notes | Estimates | Reads abbreviations, builds material draft |
| Hand-drawn sketch | Estimates | Reads dimensions and square counts |
| Work order | Estimates | Confirms job type, squares, labor |
| Handwritten material sheet | Material Lists | Generates final crew pull list |
| Signed contract | (Active Jobs — coming soon) | Moves job to active phase |

**If you're not sure which section:** upload to Estimates. Maxwell will determine the document type.

---

## Estimates: Status Meanings

| Status | Meaning |
|---|---|
| Open | Estimate created, customer has it or it's being finalized |
| Sent | Estimate was sent to the customer |
| Won | Customer signed a contract — triggers Phase 2 |
| Lost | Customer went with another company |

Estimates are **never deleted**. Even lost estimates stay in the system for reporting and future follow-up.

---

## Flags

When Maxwell can't figure something out, he raises a **flag** instead of guessing.

- **Blocking flag** — must be resolved before the estimate or material list can be finalized
- **Warning flag** — should be reviewed but doesn't stop the process
- **Info** — just a note

Common flags:
- Square footage discrepancy (sketch ≠ work order)
- Metal LF not recorded
- Pipe boot size not confirmed
- Unknown abbreviation

---

## The Team (AI Employees)

| Name | Role | What they do |
|---|---|---|
| Maxwell | Manager | Routes all documents, delegates tasks |
| Jordan | Front End Developer | Builds the dashboard UI |
| Riley | Product Researcher | IB Roof Systems product catalog research |
| Casey | Workflow Engineer | Monitors the file pipeline, keeps instructions updated |

---

## Abbreviation Legend

The system uses an abbreviation legend to translate field shorthand into product names. Key things to know:

- Pipe boots are called **A-Cone, B-Cone, C-Cone, D-Cone, E-Cone** on the material list
- Metal is measured in **linear feet (LF)** — must always be included
- **60 mil membrane** in rolls = detail/flashing membrane (not the same as field membrane in squares)
- **Term Metal** = same as Term Bar = termination metal
- **Cover Strip** is auto-calculated from perimeter metal (GS and DE only) — you don't need to write it on the field sheet

---

_Last updated: 2026-03-31_
_Maintained by Casey (Workflow Engineer)_
_Update this file whenever the dashboard sections, workflow, or rules change._
