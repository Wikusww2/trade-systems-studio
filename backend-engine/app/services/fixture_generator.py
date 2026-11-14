import os
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle

def get_nightmares_dir() -> str:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    nightmares_dir = os.path.join(os.path.dirname(current_dir), "data", "nightmares")
    os.makedirs(nightmares_dir, exist_ok=True)
    return nightmares_dir

def generate_nightmare_01(output_path: str):
    """
    nightmare_01_customs_ci.pdf:
    Authentic Commercial Invoice & Customs Entry Declaration.
    Modeled after CBP CROSS Rulings (HQ H301619 / NY N301248).
    Contains:
    1. CIF Incoterms with missing marine cargo insurance (19 CFR § 152.103)
    2. Arithmetic multiplication error (500 units @ $45.00 listed as $25,500.00)
    3. HTS Misclassification (8471.30.0100 at 0% vs 8542.31.0000 at 25% Section 301)
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter # 612 x 792

    # Top Institutional Header
    c.setStrokeColor(colors.HexColor("#0F172A"))
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, 748, "SHENZHEN SHENZHOU ADVANCED SEMICONDUCTORS CO., LTD.")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "COMMERCIAL INVOICE & CBP CUSTOMS ENTRY DECLARATION • EXPORT DIVISION")

    # Document Reference & Parties Grid
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 638, 540, 84, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 708, "INVOICE NUMBER:")
    c.drawString(46, 692, "INVOICE DATE:")
    c.drawString(46, 676, "INCOTERMS 2020:")
    c.drawString(46, 660, "PORT OF ENTRY:")
    c.drawString(46, 646, "VESSEL / VOYAGE:")

    c.setFont("Helvetica", 8)
    c.drawString(146, 708, "SSAC-2024-89912")
    c.drawString(146, 692, "April 12, 2024")
    c.drawString(146, 676, "CIF LOS ANGELES, CA (U.S.A.)")
    c.drawString(146, 660, "PORT 2704 - LOS ANGELES / LONG BEACH")
    c.drawString(146, 646, "OOCL TAIPEI / V.042E (B/L: OOCLU7829104)")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(320, 708, "SHIPPER / EXPORTER:")
    c.drawString(320, 676, "CONSIGNEE / IMPORTER OF RECORD:")

    c.setFont("Helvetica", 7.5)
    c.drawString(320, 696, "Shenzhen Shenzhou Semiconductors Ltd, Nanshan District, Shenzhen, CN")
    c.drawString(320, 664, "Pacific Crest Electronics Corp, 1420 Harbor Blvd, Long Beach, CA 90802")
    c.drawString(320, 652, "EIN / IRS # 94-2849102 • CBP Customs Broker: Mallory Alexander #14902")

    # Line Item Table Header
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(36, 608, 540, 20, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(42, 614, "LINE")
    c.drawString(70, 614, "HTS NUMBER")
    c.drawString(150, 614, "DESCRIPTION OF MERCHANDISE")
    c.drawString(340, 614, "QTY (PCS)")
    c.drawString(405, 614, "UNIT PRICE")
    c.drawString(475, 614, "TOTAL (USD)")

    # Line Items
    items = [
        ("001", "8471.30.0100", "ARM Cortex-M4 Microcontroller Core Boards", "500", "$45.00", "$25,500.00"),
        ("002", "8542.31.0000", "High-Performance Neural Tensor Accelerators", "200", "$350.00", "$70,000.00"),
        ("003", "8504.40.9580", "High-Efficiency Switching Power Supplies", "1,000", "$25.00", "$25,000.00")
    ]

    y = 586
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#0F172A"))
    for line, hts, desc, qty, price, total in items:
        c.drawString(44, y, line)
        c.drawString(70, y, hts)
        c.drawString(150, y, desc)
        c.drawString(350, y, qty)
        c.drawString(410, y, price)
        c.drawRightString(566, y, total)
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.line(36, y - 6, 576, y - 6)
        y -= 24

    # Financial Reconciliation & Freight/Insurance Ledger
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.rect(36, 410, 540, 95, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 488, "INVOICE FINANCIAL SUMMARY & INCOTERMS 2020 BREAKDOWN:")
    c.drawString(46, 470, "Merchandise Line Item Subtotal:")
    c.drawString(46, 454, "Ocean Freight (Shanghai -> Long Beach):")
    c.drawString(46, 438, "Marine Cargo Insurance (19 CFR § 152.103):")
    c.drawString(46, 420, "TOTAL DECLARED CIF INVOICE VALUE:")

    c.setFont("Helvetica", 8)
    c.drawRightString(566, 470, "$120,500.00")
    c.drawRightString(566, 454, "$4,500.00")
    c.drawRightString(566, 438, "$0.00  (OMITTED)")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 420, "$125,000.00 USD")

    # Statutory Discrepancy Warnings & Legal Audit Footnotes
    c.setFillColor(colors.HexColor("#991B1B"))
    c.rect(36, 320, 540, 75, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 380, "AUDIT WARNING: 19 U.S.C. § 1592 STATUTORY DEFECTS DETECTED")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#7F1D1D"))
    c.drawString(46, 366, "1. INCOTERM MISMATCH: Invoiced CIF Los Angeles with $0.00 Marine Insurance distorting transaction value.")
    c.drawString(46, 354, "2. ARITHMETIC ANOMALY: Line 001 (500 pcs @ $45.00) calculates to $22,500.00, not invoiced $25,500.00.")
    c.drawString(46, 342, "3. HTS MISCLASSIFICATION: Line 001 misdeclared under 8471.30 (0% duty) rather than 8542.31 (25% Section 301).")
    c.drawString(46, 330, "Statutory Penalty Exposure under 19 U.S.C. § 1592: 2.0x lawful duty loss (Negligence) or 4.0x (Gross Negligence).")

    # CBP Filer Certification & Importer Signature
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setFillColor(colors.white)
    c.rect(36, 215, 540, 95, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 294, "CBP FORM 7501 DECLARATION & BROKER CERTIFICATION:")
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 280, "I declare that the information contained on this Commercial Invoice and Entry Summary is true and correct,")
    c.drawString(46, 268, "and that all foreign assists, packing costs, and commissions under 19 CFR § 152.103 have been fully reported.")

    c.line(46, 235, 260, 235)
    c.line(300, 235, 550, 235)

    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, 224, "Authorized Signature of Importer / Agent")
    c.drawString(300, 224, "Licensed Customs Broker #14902 Certification")

    c.save()

def generate_nightmare_02(output_path: str):
    """
    nightmare_02_freight_audit.pdf:
    Ocean Carrier Freight Invoice with Demurrage & Detention.
    Modeled after FMC Docket No. 21-08 / OSRA 2022 disputes.
    Contains:
    1. Unauthorized Chassis Split Fee ($175.00)
    2. Inflated Fuel Surcharge Index (FSC billed at 28.5% vs published DOE/EIA 22.1%)
    3. Unwarranted Demurrage/Detention billed inside free-time window ($880.00)
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Ocean Line Brand Header
    c.setStrokeColor(colors.HexColor("#0369A1"))
    c.setFillColor(colors.HexColor("#0369A1"))
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, 748, "PACIFIC ALLIANCE CONTAINER LINES (GLOBAL OCEAN CARRIER)")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "COMMERCIAL FREIGHT INVOICE • INTERMODAL FREIGHT & SURCHARGES DIVISION")

    # Document Reference Grid
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 638, 540, 84, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 708, "INVOICE NUMBER:")
    c.drawString(46, 692, "BILL OF LADING (B/L):")
    c.drawString(46, 676, "VESSEL / VOYAGE:")
    c.drawString(46, 660, "PORT OF LOADING:")
    c.drawString(46, 646, "PORT OF DISCHARGE:")

    c.setFont("Helvetica", 8)
    c.drawString(150, 708, "PACL-FRT-982104")
    c.drawString(150, 692, "PACLU-894102914 (FMC #024810)")
    c.drawString(150, 676, "PACIFIC HORIZON / V.102W")
    c.drawString(150, 660, "YANTIAN (CN YTN)")
    c.drawString(150, 646, "LOS ANGELES / LONG BEACH (US LAX)")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(340, 708, "BILL-TO PARTY (IMPORTER):")
    c.drawString(340, 676, "CONTAINER & SEAL:")

    c.setFont("Helvetica", 7.5)
    c.drawString(340, 696, "Pacific Crest Electronics Corp • Long Beach, CA 90802")
    c.drawString(340, 664, "40' High Cube # PACU-9182049 • Seal: US984102")
    c.drawString(340, 652, "Vessel Discharge Date: March 24, 2024 • Free Time: 5 Days")

    # Line Item Table Header
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(36, 608, 540, 20, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(42, 614, "CODE")
    c.drawString(90, 614, "SURCHARGE / SERVICE DESCRIPTION")
    c.drawString(310, 614, "CONTRACT RATE")
    c.drawString(410, 614, "BILLED AMOUNT")
    c.drawString(495, 614, "VARIANCE")

    # Freight Charges
    charges = [
        ("BAS", "Base Ocean Freight (40' HC Container)", "$3,200.00", "$3,200.00", "$0.00"),
        ("BAF/FSC", "Bunker / Fuel Surcharge (Index 28.5% vs 22.1%)", "$707.20", "$912.00", "+$204.80 OVER"),
        ("THC", "Terminal Handling Charges (Origin/Destination)", "$450.00", "$450.00", "$0.00"),
        ("CHS", "Chassis Split & Repositioning Surcharge (Unauthorized)", "$0.00", "$175.00", "+$175.00 UNWARRANTED"),
        ("DET/DEM", "Container Detention (Billed Day 4 inside 5-day free time)", "$0.00", "$880.00", "+$880.00 UNLAWFUL")
    ]

    y = 586
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#0F172A"))
    for code, desc, base, billed, diff in charges:
        c.drawString(42, y, code)
        c.drawString(90, y, desc)
        c.drawString(320, y, base)
        c.drawString(420, y, billed)
        
        if "OVER" in diff or "UNWARRANTED" in diff or "UNLAWFUL" in diff:
            c.setFillColor(colors.HexColor("#DC2626"))
            c.setFont("Helvetica-Bold", 8)
        else:
            c.setFillColor(colors.HexColor("#0F172A"))
            c.setFont("Helvetica", 8)
            
        c.drawRightString(566, y, diff)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.setFont("Helvetica", 8)
        
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.line(36, y - 6, 576, y - 6)
        y -= 24

    # Financial Total Box
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 420, 540, 85, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 488, "FREIGHT INVOICE TOTAL & OVERBILLING RECONCILIATION:")
    c.drawString(46, 470, "Lawful Contractual Freight Total:")
    c.drawString(46, 454, "Unauthorized / Inflated Surcharges (FMC Docket 21-08):")
    c.drawString(46, 436, "TOTAL CARRIER INVOICED AMOUNT (PAYABLE):")

    c.setFont("Helvetica", 8)
    c.drawRightString(566, 470, "$4,357.20")
    c.setFillColor(colors.HexColor("#DC2626"))
    c.drawRightString(566, 454, "+$1,259.80 (28.9% OVERBILLING)")
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 436, "$5,617.00 USD")

    # FMC Dispute & OSRA Notice
    c.setFillColor(colors.HexColor("#991B1B"))
    c.rect(36, 335, 540, 75, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 395, "FEDERAL MARITIME COMMISSION (FMC) COMPLIANCE DISPUTE NOTICE")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#7F1D1D"))
    c.drawString(46, 381, "1. CHASSIS SPLIT: Intermodal chassis split fees billed without prior shipper consent violate FMC Docket 21-08.")
    c.drawString(46, 369, "2. INFLATED FSC: Billed fuel surcharge index (28.5%) exceeds the published weekly DOE/EIA benchmark (22.1%).")
    c.drawString(46, 357, "3. OSRA 2022 DETENTION VIOLATION: Detention assessed on Day 4; gate records confirm delivery within 5-day free time.")
    c.drawString(46, 345, "STATUTORY ACTION: Withholding $1,259.80 in unauthorized billing pending carrier charge dispute filing.")

    c.save()

def generate_nightmare_03(output_path: str):
    """
    nightmare_03_duty_drawback.pdf:
    Paired CBP Form 7501 Import Summary + Export Ocean Bill of Lading.
    Modeled under 19 U.S.C. § 1313(j)(1) Unused Merchandise Drawback.
    Unlocks statutory 99% customs duty refund on exported imported goods.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Header
    c.setStrokeColor(colors.HexColor("#047857"))
    c.setFillColor(colors.HexColor("#047857"))
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, 748, "U.S. CUSTOMS AND BORDER PROTECTION • ENTRY SUMMARY & DRAWBACK CLAIM")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "CBP FORM 7501 IMPORT LIQUIDATION MATCHED TO EXPORT BILL OF LADING • 19 U.S.C. § 1313")

    # Import Summary Section
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 615, 540, 105, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 705, "CBP ENTRY NUMBER:")
    c.drawString(46, 691, "ENTRY DATE:")
    c.drawString(46, 677, "PORT OF ENTRY:")
    c.drawString(46, 663, "IMPORTER OF RECORD:")
    c.drawString(46, 649, "HTS CLASSIFICATION:")
    c.drawString(46, 631, "DUTIES & FEES TENDERED:")

    c.setFont("Helvetica", 8)
    c.drawString(180, 705, "CBP-7501-84920184")
    c.drawString(180, 691, "January 15, 2024 (Liquidated Entry)")
    c.drawString(180, 677, "Port 2704 - Los Angeles / Long Beach")
    c.drawString(180, 663, "Pacific Crest Electronics Corp (IRS # 94-2849102)")
    c.drawString(180, 649, "8542.31.0001 (Electronic Integrated Circuits - Processors)")
    c.setFont("Helvetica-Bold", 8)
    c.drawString(180, 631, "$20,000.00 Customs Duty (10% General Duty on $200,000 Entered Value)")

    # Export Match Section
    c.setStrokeColor(colors.HexColor("#047857"))
    c.setFillColor(colors.HexColor("#ECFDF5"))
    c.rect(36, 385, 540, 215, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 585, "19 U.S.C. § 1313 UNUSED MERCHANDISE DRAWBACK MATCHING VERIFICATION:")
    
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 472, "Export Carrier / Vessel:")
    c.drawString(46, 458, "Export Ocean Bill of Lading:")
    c.drawString(46, 444, "Export Departure Date:")
    c.drawString(46, 430, "Port of Export / Destination:")
    c.drawString(46, 416, "Exported Quantity / Part:")
    c.drawString(46, 396, "STATUTORY 99% DUTY DRAWBACK REFUND:")

    c.setFont("Helvetica", 8)
    c.drawString(180, 472, "APL Logistics / CMA CGM (Vessel: APL SINGAPORE)")
    c.drawString(180, 458, "APLU-0941824 (Export Declaration ITN: X20240310998)")
    c.drawString(180, 444, "March 10, 2024 (Exported 55 Days Post-Import Entry)")
    c.drawString(180, 430, "Port of Los Angeles -> Rotterdam, Netherlands (NLRTM)")
    c.drawString(180, 416, "1,000 Units High-Density Solid-State Memory Modules (Matched)")

    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 396, "$19,800.00 CASH REFUND")
    c.line(46, 408, 566, 408)

    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(46, 376, "Statutory Formula: Lawful Duties Paid ($20,000.00) x 99% Drawback Allowance = $19,800.00 Net Refund.")
    c.drawString(46, 362, "Claim is fully authenticated within the 5-year statutory filing deadline under 19 U.S.C. § 1313(r).")
    c.drawString(46, 350, "CBP ACE Drawback Entry Type 41 ready for automated liquidation.")

    # Customs Broker Signature & Submission Box
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setFillColor(colors.white)
    c.rect(36, 215, 540, 115, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 316, "CBP DRAWBACK DECLARATION & LIQUIDATION CERTIFICATION:")
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 302, "I certify that the merchandise described herein was imported, duty paid, and exported without being subjected")
    c.drawString(46, 290, "to any manufacturing process other than inspection and packaging, fulfilling all criteria under 19 U.S.C. § 1313.")

    c.line(46, 250, 260, 250)
    c.line(300, 250, 550, 250)

    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, 238, "Claimant Authorized Officer: Pacific Crest Electronics")
    c.drawString(300, 238, "Drawback Broker Specialist License: #21904")

    c.setFont("Helvetica", 7)
    c.drawString(46, 226, "Marcus Vance • VP Global Supply Chain")
    c.drawString(300, 226, "National Drawback Processing Center, Newark NJ")

    c.save()

def generate_clean_01(output_path: str):
    """
    clean_01_customs_fob.pdf:
    Production Clean Commercial Invoice with verified FOB terms and GAAP assist disclosures.
    Zero statutory defects; certified 100% compliant entry summary.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Header
    c.setStrokeColor(colors.HexColor("#0F172A"))
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, 748, "SHENZHEN ADVANCED SEMICONDUCTORS CO., LTD.")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "CERTIFIED COMMERCIAL INVOICE • FOB EXPORT DECLARATION • COMPLIANT FILING")

    # Document Reference Grid
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 638, 540, 84, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 708, "INVOICE NUMBER:")
    c.drawString(46, 692, "INVOICE DATE:")
    c.drawString(46, 676, "INCOTERMS 2020:")
    c.drawString(46, 660, "PORT OF ENTRY:")
    c.drawString(46, 646, "VESSEL / VOYAGE:")

    c.setFont("Helvetica", 8)
    c.drawString(146, 708, "SSAC-2024-CLN-1048")
    c.drawString(146, 692, "May 18, 2024")
    c.drawString(146, 676, "FOB YANTIAN, CHINA (VERIFIED)")
    c.drawString(146, 660, "PORT 2704 - LOS ANGELES / LONG BEACH")
    c.drawString(146, 646, "MAERSK MC-KINNEY MOLLER / V.2405")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(320, 708, "SHIPPER / EXPORTER:")
    c.drawString(320, 676, "CONSIGNEE / IMPORTER OF RECORD:")

    c.setFont("Helvetica", 7.5)
    c.drawString(320, 696, "Shenzhen Advanced Semiconductors Ltd, High-Tech Industrial Park, CN")
    c.drawString(320, 664, "Pacific Crest Electronics Corp, Long Beach, CA 90802")
    c.drawString(320, 652, "EIN / IRS # 94-2849102 • Licensed Broker #14902")

    # Line Item Table Header
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(36, 608, 540, 20, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(42, 614, "LINE")
    c.drawString(70, 614, "HTS NUMBER")
    c.drawString(150, 614, "DESCRIPTION OF MERCHANDISE")
    c.drawString(340, 614, "QTY (PCS)")
    c.drawString(405, 614, "UNIT PRICE")
    c.drawString(475, 614, "TOTAL (USD)")

    # Line Items (Perfect Arithmetic Q x P = T)
    items = [
        ("001", "8542.31.0001", "ARM Cortex-M4 Microcontroller Processors", "500", "$45.00", "$22,500.00"),
        ("002", "8542.31.0001", "High-Performance Neural Tensor Accelerators", "200", "$350.00", "$70,000.00"),
        ("003", "8504.40.9580", "High-Efficiency Switching Power Supplies", "1,000", "$25.00", "$25,000.00")
    ]

    y = 586
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#0F172A"))
    for line, hts, desc, qty, price, total in items:
        c.drawString(44, y, line)
        c.drawString(70, y, hts)
        c.drawString(150, y, desc)
        c.drawString(350, y, qty)
        c.drawString(410, y, price)
        c.drawRightString(566, y, total)
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.line(36, y - 6, 576, y - 6)
        y -= 24

    # Reconciliation Box
    c.setStrokeColor(colors.HexColor("#059669"))
    c.setFillColor(colors.HexColor("#ECFDF5"))
    c.rect(36, 420, 540, 85, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 488, "STATUTORY VALUATION COMPLIANCE CERTIFICATION (19 CFR § 152.103):")
    c.drawString(46, 470, "FOB Transaction Value (No Non-Dutiable Freight Contamination):")
    c.drawString(46, 454, "Certified GAAP Buyer-Supplied Assists Disclosed (AST-2026-001):")
    c.drawString(46, 436, "TOTAL LAWFUL DUTIABLE VALUE DECLARED:")

    c.setFont("Helvetica", 8)
    c.drawRightString(566, 470, "$117,500.00")
    c.drawRightString(566, 454, "$27,750.00 (Disclosed)")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 436, "$145,250.00 USD")

    # Green Clean Badge
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 380, "✓ ZERO STATUTORY DEFECTS DETECTED • 100% CBP PRE-CLEARANCE CERTIFIED")
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 366, "1. Arithmetic cross-multiplication verified: 100% exact match ($22,500.00 + $70,000.00 + $25,000.00 = $117,500.00).")
    c.drawString(46, 354, "2. FOB terms strictly segregated from ocean freight; zero risk of double taxation on international logistics overhead.")
    c.drawString(46, 342, "3. All tooling assists amortized and declared in compliance with 19 CFR § 152.103(e). Zero Section 1592 exposure.")

    c.save()

def generate_all_nightmares():
    out_dir = get_nightmares_dir()
    generate_nightmare_01(os.path.join(out_dir, "nightmare_01_customs_ci.pdf"))
    generate_nightmare_02(os.path.join(out_dir, "nightmare_02_freight_audit.pdf"))
    generate_nightmare_03(os.path.join(out_dir, "nightmare_03_duty_drawback.pdf"))
    generate_clean_01(os.path.join(out_dir, "clean_01_customs_fob.pdf"))
    print(f"Generated authentic trade PDF documents in: {out_dir}")

if __name__ == "__main__":
    generate_all_nightmares()
