from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "/Users/Gary/Desktop/workspace/capitol_roofing_pricing_form.pdf"

NAVY = colors.HexColor("#0f2d4a")
ORANGE = colors.HexColor("#f97316")
LIGHT = colors.HexColor("#f1f5f9")
LINE = colors.HexColor("#cbd5e1")

def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=20, textColor=NAVY, spaceAfter=2)
    sub_style   = ParagraphStyle("Sub",   fontName="Helvetica",      fontSize=10, textColor=colors.HexColor("#64748b"), spaceAfter=16)
    section_style = ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=11, textColor=colors.white, spaceAfter=0)
    note_style  = ParagraphStyle("Note",  fontName="Helvetica-Oblique", fontSize=8, textColor=colors.HexColor("#94a3b8"), spaceAfter=12)
    instr_style = ParagraphStyle("Instr", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"), spaceAfter=14,
                                  borderPad=6, backColor=colors.HexColor("#fff7ed"),
                                  borderColor=ORANGE, borderWidth=0.5, borderRadius=4)

    def section_header(text):
        data = [[Paragraph(text, section_style)]]
        t = Table(data, colWidths=[7.0*inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), NAVY),
            ("TOPPADDING",    (0,0), (-1,-1), 7),
            ("BOTTOMPADDING", (0,0), (-1,-1), 7),
            ("LEFTPADDING",   (0,0), (-1,-1), 10),
            ("RIGHTPADDING",  (0,0), (-1,-1), 10),
            ("ROUNDEDCORNERS", [4]),
        ]))
        return t

    def field_row(label, hint="", unit="$", wide=False):
        """Returns a table row with label and fill-in line."""
        line = "_" * (30 if wide else 20)
        unit_str = f"  {unit}" if unit else ""
        label_para = Paragraph(label, ParagraphStyle("FL", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#1e293b")))
        hint_para  = Paragraph(hint,  ParagraphStyle("FH", fontName="Helvetica-Oblique", fontSize=8, textColor=colors.HexColor("#94a3b8"))) if hint else Paragraph("", styles["Normal"])
        fill_para  = Paragraph(f"{unit_str}  {line}", ParagraphStyle("FF", fontName="Helvetica", fontSize=10, textColor=LINE))

        inner = Table([[label_para], [hint_para]], colWidths=[4.5*inch])
        inner.setStyle(TableStyle([("TOPPADDING",(0,0),(-1,-1),1),("BOTTOMPADDING",(0,0),(-1,-1),1),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0)]))

        row = Table([[inner, fill_para]], colWidths=[4.6*inch, 2.4*inch])
        row.setStyle(TableStyle([
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
            ("TOPPADDING",    (0,0), (-1,-1), 7),
            ("BOTTOMPADDING", (0,0), (-1,-1), 7),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("RIGHTPADDING",  (0,0), (-1,-1), 8),
            ("LINEBELOW",     (0,0), (-1,-1), 0.5, LINE),
        ]))
        return row

    def spacer(h=8):
        return Spacer(1, h)

    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(Paragraph("Capitol Roofing", title_style))
    story.append(Paragraph("Pricing &amp; Rules — Owner Input Form", sub_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))
    story.append(Paragraph(
        "Fill in every field below. Leave nothing blank — write $0 if an item is not charged. "
        "When complete, scan or photograph this form and upload it. "
        "The system will update all pricing automatically.",
        instr_style))
    story.append(spacer(4))

    # ── Section 1: Base Pricing ──────────────────────────────────────────────
    story.append(section_header("1  Base Pricing — Per Square (100 sq ft)"))
    story.append(spacer(4))
    story.append(field_row("Tear-off & Replace — price per square",      "Includes: tear-off labor, disposal, IB membrane, insulation, fasteners"))
    story.append(field_row("Overlay / Recover — price per square",        "Includes: IB membrane, cover board if needed, fasteners or adhesive"))
    story.append(spacer(12))

    # ── Section 2: Penetration Extras ───────────────────────────────────────
    story.append(section_header("2  Penetration Extras — Per Item"))
    story.append(spacer(4))
    story.append(field_row("Pipe penetration — small (≤ 4\")",    "Standard IB pipe boot"))
    story.append(field_row("Pipe penetration — large (> 4\")",    "Large boot or custom detail"))
    story.append(field_row("HVAC unit / equipment curb",           "Flash all 4 sides of curb"))
    story.append(field_row("Roof drain / sump",                    "Remove & reset drain, sump detail"))
    story.append(field_row("Skylight",                             "Flash all 4 sides"))
    story.append(field_row("Scupper / overflow drain",             "Per each"))
    story.append(field_row("Inside corner",                        "Each corner detail"))
    story.append(field_row("Outside corner",                       "Each corner detail"))
    story.append(field_row("Parapet wall / cant strip",            "Price is per linear foot", unit="$ / LF"))
    story.append(spacer(12))

    # ── Section 3: Detail Surcharge ─────────────────────────────────────────
    story.append(section_header("3  High-Detail Surcharge"))
    story.append(spacer(4))
    story.append(field_row("Surcharge when penetrations + details exceed 15 items", "Flat amount added to total — not per item"))
    story.append(spacer(12))

    # ── Section 4: Logistics ────────────────────────────────────────────────
    story.append(section_header("4  Logistics Adjustments — Per Square"))
    story.append(spacer(4))
    story.append(field_row("2-story building — add per square",               "Applied when building is 2 stories"))
    story.append(field_row("3+ stories or ladder access only — add per square", "Applied when no hatch/stairs"))
    story.append(field_row("Walk distance 50–150 ft — add per square",        "Distance from truck to roof access"))
    story.append(field_row("Walk distance over 150 ft — add per square",      "Flag for crew discussion as well"))
    story.append(field_row("Urban / high foot traffic site management fee",    "Flat fee added to total — pedestrian areas, no staging"))
    story.append(spacer(12))

    # ── Section 5: Disposal ─────────────────────────────────────────────────
    story.append(section_header("5  Debris & Disposal"))
    story.append(spacer(4))
    story.append(field_row("Standard dumpster — tear-off jobs",              "Included in every tear-off estimate"))
    story.append(field_row("Additional layer disposal — per extra layer",    "Added on top of standard dumpster"))
    story.append(field_row("Overlay / recover disposal fee",                 "No dumpster — minor debris from edge trimming"))
    story.append(spacer(12))

    # ── Section 6: Decking ──────────────────────────────────────────────────
    story.append(section_header("6  Decking Repair Allowance — Tear-off Only"))
    story.append(spacer(4))
    story.append(field_row("Decking repair allowance — per square",         "Included in every tear-off; extra damage billed at cost", unit="$ / sq"))
    story.append(field_row("Decking repair — minimum flat amount",           "Use whichever is higher: per-square or this minimum"))
    story.append(spacer(12))

    # ── Section 7: Minimum Job ──────────────────────────────────────────────
    story.append(section_header("7  Minimum Job Rules"))
    story.append(spacer(4))
    story.append(field_row("Minimum job threshold — flag if estimate is under", "Any estimate below this amount gets a minimum charge applied"))
    story.append(field_row("Minimum job charge",                                "The minimum we charge for any job"))
    story.append(spacer(12))

    # ── Section 8: Derived Materials ────────────────────────────────────────
    story.append(section_header("8  Derived Materials — Add More Rules Here"))
    story.append(spacer(4))
    story.append(Paragraph(
        "The IB cover strip rule is already entered: 1 roll per 90 LF of IB PVC clad metal. "
        "Use the space below to add any other automatic material rules you know of.",
        ParagraphStyle("Dm", fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#475569"), spaceAfter=10)
    ))

    rule_rows = []
    headers = [
        Paragraph("Trigger Material / Condition", ParagraphStyle("H", fontName="Helvetica-Bold", fontSize=9, textColor=colors.white)),
        Paragraph("Auto-Add Material", ParagraphStyle("H", fontName="Helvetica-Bold", fontSize=9, textColor=colors.white)),
        Paragraph("Calculation", ParagraphStyle("H", fontName="Helvetica-Bold", fontSize=9, textColor=colors.white)),
    ]
    rule_rows.append(headers)

    # Pre-filled example
    rule_rows.append([
        Paragraph("IB PVC clad metal (any type)", ParagraphStyle("Ex", fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#64748b"))),
        Paragraph("IB Cover Strip", ParagraphStyle("Ex", fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#64748b"))),
        Paragraph("1 roll per 90 LF (round up)", ParagraphStyle("Ex", fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#64748b"))),
    ])
    # Blank rows
    blank = [Paragraph("", styles["Normal"]), Paragraph("", styles["Normal"]), Paragraph("", styles["Normal"])]
    for _ in range(6):
        rule_rows.append(blank)

    rules_table = Table(rule_rows, colWidths=[2.5*inch, 2.1*inch, 2.4*inch], rowHeights=[None] + [None] + [0.45*inch]*6)
    rules_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  NAVY),
        ("BACKGROUND",    (0,1), (-1,1),  LIGHT),
        ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.5, LINE),
        ("ROWBACKGROUNDS",(0,2), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(rules_table)
    story.append(spacer(20))

    # ── Footer ───────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LINE, spaceAfter=8))
    story.append(Paragraph(
        "Once complete, upload this form to the system. All [BOSS TO FILL] fields will be updated automatically. "
        "Version: 2026-03-30",
        ParagraphStyle("Footer", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER)
    ))

    doc.build(story)
    print(f"PDF saved to: {OUTPUT}")

if __name__ == "__main__":
    build()
