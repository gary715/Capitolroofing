/**
 * Seed training rules from the Q&A session answers.
 * Run: npx tsx scripts/seed-rules.ts
 */

import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";

const dbPath = join(__dirname, "..", "..", "data", "db", "capitol_roofing.db");
mkdirSync(join(__dirname, "..", "..", "data", "db"), { recursive: true });
const db = new Database(dbPath);

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS training_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    subcategory TEXT,
    rule_text TEXT NOT NULL,
    source_document TEXT,
    source_session_id INTEGER,
    confidence TEXT DEFAULT 'learned'
      CHECK(confidence IN ('assumed','learned','verified','locked')),
    times_used INTEGER DEFAULT 0,
    last_used TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

const insert = db.prepare(`
  INSERT INTO training_rules (category, subcategory, rule_text, source_document, confidence)
  VALUES (?, ?, ?, ?, ?)
`);

const rules: Array<[string, string | null, string, string, string]> = [
  // ─── Membrane ──────────────────────────────────────────────────────────
  ["materials", "membrane", "50 mil and 60 mil rolls: 6' wide x 90' long = 5.4 SQ (540 SF) per roll.", "Q&A Session 1", "learned"],
  ["materials", "membrane", "80 mil rolls: 6' wide x 60' long = 3.6 SQ (360 SF) per roll.", "Q&A Session 1", "learned"],
  ["materials", "membrane", "All membrane rolls installed with 6\" overlap (lap). 2\" barbed seam plates installed under the lap, then heat welded with hot air gun.", "Q&A Session 1", "learned"],
  ["materials", "membrane", "80 mil requires T-patches at every seam intersection where horizontal and vertical welds meet. 50/60 mil do not require T-patches.", "Q&A Session 1", "learned"],
  ["materials", "membrane", "On 80 mil jobs with parapet walls: install 80 mil in the field, 60 mil on the walls (easier to work with vertically). 60 mil laps 6\" onto the field over the 80 mil.", "Q&A Session 1", "learned"],
  ["materials", "membrane", "When 60 mil covers parapet walls on an 80 mil job, add Gravel Stop (GS) to the top edge of the wall.", "Q&A Session 1", "learned"],

  // ─── Measurements ──────────────────────────────────────────────────────
  ["measurements", "square footage", "Material SQ includes walls (perimeter x wall height). Insulation SQ is 2D field only (flat roof area without walls). Work order SQ >= sketch SQ because work order includes wall coverage.", "Q&A Session 1", "learned"],
  ["measurements", "square footage", "Example: 326 Bloomfield sketch = 10.09 SQ (insulation/field), work order = 18 SQ (includes wall membrane coverage).", "Q&A Session 1", "learned"],

  // ─── Metal Fabrication ─────────────────────────────────────────────────
  ["materials", "metal", "Capitol Roofing fabricates metal in-house. Standard piece length = 10 LF. Every piece is 10 feet.", "Q&A Session 1", "learned"],
  ["materials", "metal", "Metal quantities written as LF (linear feet) or pcs (pieces). Each piece = 10 LF.", "Q&A Session 1", "learned"],
  ["materials", "metal", "Common profiles are on the shop list. Uncommon profiles: crew refers to the drawing.", "Q&A Session 1", "learned"],
  ["materials", "metal", "LF may be omitted from walkthrough when profile is uncommon — must be calculated from perimeter measurements.", "Q&A Session 1", "learned"],

  // ─── Metal Profiles / Terminology ──────────────────────────────────────
  ["terminology", "metal profiles", "DE = Drip Edge. Number after DE = face size (DE3 = 3\" face, DE4 = 4\" face). DE\"\" = face size TBD.", "Q&A Session 1", "learned"],
  ["terminology", "metal profiles", "GS = Gravel Stop. Number after GS = face size (GS3, GS4 most common). GS\"\" = face size TBD. Face = part that hangs off wall covering siding/facade at roof level.", "Q&A Session 1", "learned"],
  ["terminology", "metal profiles", "Roof side dimension is standard for DE and GS unless stated otherwise in the document. Only the face changes.", "Q&A Session 1", "learned"],

  // ─── Pitch Pockets ─────────────────────────────────────────────────────
  ["materials", "pitch pockets", "Pitch pocket = L-bend sheet metal square installed around odd-shaped roof penetrations (wire bundles, AC copper lines, conduit clusters).", "Q&A Session 1", "learned"],
  ["materials", "pitch pockets", "Standard pitch pocket: 3\" x 3\" (3\" footprint on roof, 3\" high). Custom heights noted when different (e.g., '5\" High').", "Q&A Session 1", "learned"],
  ["materials", "pitch pockets", "Pitch pocket filler measured in tubes. '2' = 2 tubes of filler.", "Q&A Session 1", "learned"],
  ["materials", "pitch pockets", "Standard length for pitch pockets = 10' (same as all prefab metal).", "Q&A Session 1", "learned"],

  // ─── Corners ───────────────────────────────────────────────────────────
  ["materials", "corners", "OS (Outside Corners) = IB Roof Systems prefabricated corners for outside angles. Installed after roofing to seal seams at exterior corners.", "Q&A Session 1", "learned"],
  ["materials", "corners", "IS (Inside Corners) = IB Roof Systems prefabricated corners for inside angles. Used where roof meets wall in a corner (horizontal/vertical intersection).", "Q&A Session 1", "learned"],
  ["materials", "corners", "4 corners per rectangular penetration/curb. Example: 8 AC units + 2 skylights = (8+2) x 4 = 40 OS corners.", "Q&A Session 1", "learned"],
  ["materials", "corners", "High OS corner counts (30+) are normal on parapet-heavy buildings with multiple package units and skylights.", "Q&A Session 1", "learned"],

  // ─── Exclusions ────────────────────────────────────────────────────────
  ["materials", "exclusions", "Unistrut (steel channel for electrical/HVAC mounting) is rarely used. Do not include in standard roofing estimates.", "Q&A Session 1", "learned"],

  // ─── Pipe Boots ────────────────────────────────────────────────────────
  ["materials", "pipe boots", "Pipe boot sizes A, B, C correspond to pipe diameter ranges. Exact ranges to be confirmed from IB Roof Systems (ibroof.com).", "Q&A Session 1", "assumed"],

  // ─── Future Items ──────────────────────────────────────────────────────
  ["specifications", "metal strips", "Prefabricated metal strip sizes for each profile (DE, GS, Cap, etc.) to be added for automated estimating. Will map profile type + LF to material quantity.", "Q&A Session 1", "assumed"],
];

const tx = db.transaction(() => {
  for (const [category, subcategory, rule_text, source, confidence] of rules) {
    insert.run(category, subcategory, rule_text, source, confidence);
  }
});

tx();

console.log(`Seeded ${rules.length} training rules.`);
db.close();
