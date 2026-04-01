# Derived Materials Rules — Capitol Roofing

These rules define items that are **automatically added** based on other items in the material list.
The system applies these rules after parsing the field sheet — they do not need to be written on the field notes.

---

## Rule 1: IB Cover Strip from Perimeter Metal LF

**Trigger:** Any IB PVC clad **perimeter** metal is listed with confirmed LF.

**Formula:** `Total perimeter metal LF ÷ 90 = number of rolls (round up to nearest whole number)`

**Perimeter metal that triggers this rule:**
- GS (Gravel Stop) — all heights (GS4, GS5, GS6, etc.)
- DE (Drip Edge) — all profiles

**Metal that does NOT trigger this rule:**
- Sep 3x3 (Separator metal)
- Sep 4x4 (Separator metal)
- Service Metal
- Term Metal (Termination bar/metal)
- Coping Cap

> **Why:** Cover strip seals the heat-welded seam between the IB field membrane and the PVC clad perimeter metal edge. Separators and service metal are not heat-welded to the membrane in the same way.

**Example:**
- GS5: 80 LF + DE 4x4: 40 LF = 120 LF total → 120 ÷ 90 = 1.33 → **2 rolls IB Cover Strip**

**Validation (914 Bloomfield):**
- GS4: 53 LF + GS6: 20 LF + DE: 5 LF = 78 LF perimeter metal → 78 ÷ 90 = 0.87 → **1 roll**
- Sep 3x3: 10 LF + Sep 4x4: 40 LF + Service Metal: 30 LF = 80 LF **excluded**
- Cover strip on 914 Bloomfield spreadsheet = 0 (not yet ordered) — this is a **quantity not pulled**, not zero needed

> **Note on spreadsheet zeros:** The spreadsheet tracks what needs to be **pulled from warehouse**, not what's theoretically needed. A zero may mean "not pulled yet" rather than "not needed." Always calculate from LF rather than trusting the zero on a raw spreadsheet.

---

## Rule 2: Fasteners with ISO Boards

**Trigger:** Any ISO insulation board is listed with a board count.

**Formula:** [BOSS TO FILL — how many screws and plates per board?]

**Items auto-added:**
- 4" Screws (boxes)
- Membrane Plates 2-3/8" (boxes)

> Currently requires boss to define the screws-per-board ratio before this rule can run automatically.

---

## Rule 3: Drain Liner with Commercial Drain

**Trigger:** A commercial roof drain (3" or 4" PVC) is listed.

**Auto-add:** 1 Drain Liner per drain.

**Example:** 2 drains (one 3", one 4") → 2 drain liners

---

## Rule 4: Pitch Pocket Filler with Pitch Pockets

**Trigger:** Pitch pockets are listed with LF.

**Formula:** [BOSS TO FILL — how many bags of filler per LF of pitch pocket?]

**Items auto-added:**
- Pitch Pocket Filler (bags)

---

## Rule 5: Unistrut with HVAC Wood Removal

**Trigger:** Work order or notes indicate "remove wood bracket/blocking" for HVAC unit.

**Auto-add:** Unistrut (quantity = [BOSS TO FILL — how many pieces per HVAC unit?])

---

## Notes on Cover Strip Scope

The cover strip rule was validated against two real jobs:

| Job | Perimeter Metal | Cover Strip Needed |
|---|---|---|
| 326 Bloomfield | GS5: 80 LF + Term bar: 40 LF = 120 LF | 2 rolls (120 ÷ 90 = 1.33 → 2) |
| 914 Bloomfield | GS4: 53 + GS6: 20 + DE: 5 = 78 LF | 1 roll (78 ÷ 90 = 0.87 → 1) |

> **326 Bloomfield note:** Term bar was included in the original calculation but the boss confirmed cover strip only applies to GS and DE. The 326 Bloomfield number (2 rolls) happened to be correct because 80 LF ÷ 90 = 0.89 → 1 roll (GS only) — but the work order matched the 2-roll number. **Confirm with boss whether Term Metal counts for cover strip.**

---

_Last updated: 2026-03-31_
_Maintained by Maxwell_
