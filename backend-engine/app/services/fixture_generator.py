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

    c.setFont("Helvetica", 8)
    c.drawString(320, 696, "Shenzhen Shenzhou Adv. Semiconductors Co., Ltd.")
    c.drawString(320, 686, "High-Tech Industrial Park, Nanshan, Shenzhen, PRC")
    c.drawString(320, 664, "Pacific Apex Computing Systems Inc.")
    c.drawString(320, 654, "1200 S Harbor Blvd, Suite 400, Los Angeles, CA 90731")

    # Line Item Table
    data = [
        ["Line", "Part No. & Description", "Declared HTS", "Quantity", "Unit Price", "Total USD"],
        ["001", "DSP Sub-System Controllers (DSP-68000)\nDual-Core Embedded Signal Processors", "8542.31.0000", "500 PCS", "$45.00", "$25,500.00"],
        ["002", "High-Throughput Deep Learning Neural Units\nModel DPU-900 Accelerator Modules", "8471.30.0100", "1,000 PCS", "$125.00", "$125,000.00"],
        ["003", "PCIe Gen 5 Bus Interface Transceivers\nHigh-Speed Interface Monolithic ICs", "8542.39.0000", "1,000 PCS", "$15.00", "$15,000.00"],
    ]

    table = Table(data, colWidths=[35, 215, 95, 60, 65, 70])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))

    table.wrapOn(c, 540, 300)
    table.drawOn(c, 36, 480)

    # Valuation & Incoterms Cost Allocation Breakdown
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 320, 540, 145, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 450, "CBP VALUATION & INCOTERMS 2020 COST ALLOCATION BREAKDOWN:")

    c.setFont("Helvetica", 8)
    c.drawString(46, 432, "Merchandise Stated Subtotal (3 Lines):")
    c.drawString(46, 416, "International Ocean Freight (Shenzhen -> Los Angeles):")
    c.drawString(46, 400, "Marine Cargo & Transit Insurance:")
    c.drawString(46, 384, "Port Origin Handling & Drayage Fees:")
    c.drawString(46, 364, "INVOICE TOTAL PAYABLE (CIF LOS ANGELES):")

    c.drawRightString(566, 432, "$165,500.00")
    c.drawRightString(566, 416, "$1,200.00")
    c.drawRightString(566, 400, "$0.00")
    c.drawRightString(566, 384, "$0.00")

    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 364, "$166,700.00")
    c.line(46, 375, 566, 375)

    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(46, 344, "Note: Under 19 CFR § 152.103, goods invoiced on CIF terms must document seller-procured marine insurance.")
    c.drawString(46, 332, "Absence of marine cargo insurance on CIF imports misstates lawful transaction value and triggers customs valuation scrutiny.")

    # Declarant Legal Certification Box
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setFillColor(colors.white)
    c.rect(36, 175, 540, 130, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 290, "EXPORTER & CUSTOMS DECLARANT CERTIFICATION:")
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 276, "I declare under penalty of perjury under the laws of the United States and the People's Republic of China that this")
    c.drawString(46, 264, "invoice is in all respects correct and true, and that the prices set forth represent the actual transaction value.")

    c.line(46, 210, 260, 210)
    c.line(300, 210, 550, 210)

    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, 198, "Authorized Signature / Declarant (Exporter)")
    c.drawString(300, 198, "U.S. Licensed Customs Broker License No. 18294")

    c.setFont("Helvetica", 7)
    c.drawString(46, 186, "Zhang Wei • Managing Director, Global Trade")
    c.drawString(300, 186, "Harbor Gateway Customs Brokerage LLC (Los Angeles, CA)")

    # Official Seal Representation
    c.setStrokeColor(colors.HexColor("#0F172A"))
    c.circle(520, 245, 22, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 5)
    c.drawCentredString(520, 248, "CBP ENTRY")
    c.drawCentredString(520, 242, "PORT 2704")

    c.save()


def generate_nightmare_02(output_path: str):
    """
    nightmare_02_freight_audit.pdf:
    Authentic Ocean Carrier Freight Bill.
    Modeled after FMC Docket 21-08 and OSRA 2022 carrier dispute filings.
    Contains:
    1. Pier 400 Chassis Split Surcharge ($285.00 unauthorized)
    2. Inflated Fuel Surcharge Index (32.5% vs 24.2% contracted = $373.50 overbilling)
    3. Terminal Demurrage inside 4-day port free time ($450.00 unlawful)
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Carrier Header Bar
    c.setFillColor(colors.HexColor("#1E3A8A")) # Maritime Navy
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, 748, "MEDITERRANEAN SHIPPING COMPANY (USA) INC.")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "OCEAN FREIGHT BILL & COMMERCIAL CARRIER CHARGE INVOICE • PACIFIC TRADELANE")

    # Document Reference Grid
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 620, 540, 102, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 706, "INVOICE NUMBER:")
    c.drawString(46, 692, "INVOICE DATE:")
    c.drawString(46, 678, "BILL OF LADING NO:")
    c.drawString(46, 664, "VESSEL / VOYAGE:")
    c.drawString(46, 650, "PORT OF DISCHARGE:")
    c.drawString(46, 636, "CONTAINER NUMBER:")

    c.setFont("Helvetica", 8)
    c.drawString(150, 706, "MSC-US-2024-99812")
    c.drawString(150, 692, "April 18, 2024")
    c.drawString(150, 678, "MEDUS9842104 (FMC Tariff No. 024)")
    c.drawString(150, 664, "MSC OSCAR / VOYAGE 2408W")
    c.drawString(150, 650, "Los Angeles Pier 400 (APMT)")
    c.drawString(150, 636, "MSCU-9041284 (40ft High-Cube • Tare: 3,920 KG)")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(320, 706, "BILL-TO CONSIGNEE:")
    c.drawString(320, 664, "ORIGIN & ROUTING:")

    c.setFont("Helvetica", 8)
    c.drawString(320, 694, "Pacific Horizon Distribution LLC")
    c.drawString(320, 684, "2400 E Imperial Hwy, El Segundo, CA 90245")
    c.drawString(320, 674, "Contract Account: MSC-PHD-88219")
    c.drawString(320, 652, "Port of Loading: Yantian, PRC (CNSZN)")
    c.drawString(320, 642, "Intermodal Gateway: LAX / Long Beach Drayage")

    # Line Item Table
    data = [
        ["Code", "Charge Item Description", "Basis / Units", "Rate", "Amount USD"],
        ["BAS", "Ocean Freight Base Rate (40' HC Container)", "1 Container", "$4,500.00", "$4,500.00"],
        ["FSC", "Fuel Surcharge Index (BAF / Bunker Adjustment)", "32.50% Base", "32.50%", "$1,462.50"],
        ["THC", "Destination Terminal Handling Charge (Pier 400)", "Per Container", "$425.00", "$425.00"],
        ["SPL", "Chassis Split Surcharge (Terminal to Off-Dock Depot)", "Auxiliary Dray", "$285.00", "$285.00"],
        ["DEM", "Port Terminal Demurrage & Storage (2 Days In-Gate)", "2 Days @ $225", "$225.00/day", "$450.00"],
    ]

    table = Table(data, colWidths=[40, 240, 100, 75, 85])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))

    table.wrapOn(c, 540, 300)
    table.drawOn(c, 36, 420)

    # Subtotals & Payment Terms Box
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 275, 540, 135, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 395, "ACCOUNT SUMMARY & SETTLEMENT TERMS:")

    c.setFont("Helvetica", 8)
    c.drawString(46, 378, "Base Ocean Transportation Charges:")
    c.drawString(46, 362, "Carrier Accessorial Surcharges (FSC + THC + SPL):")
    c.drawString(46, 346, "Port Terminal Detention & Demurrage Fees:")
    c.drawString(46, 324, "TOTAL AMOUNT DUE (PRE-PAYMENT TERMS):")

    c.drawRightString(566, 378, "$4,500.00")
    c.drawRightString(566, 362, "$2,172.50")
    c.drawRightString(566, 346, "$450.00")

    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(566, 324, "$7,122.50")
    c.line(46, 335, 566, 335)

    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(46, 304, "Payment Terms: Net 15 Days from vessel arrival. Remit electronically to MSC Accounts Receivable.")
    c.drawString(46, 292, "Under FMC regulations and OSRA 2022, billed demurrage is subject to mandatory terminal free-time audit.")

    # FMC Statutory Advisory Notice
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setFillColor(colors.white)
    c.rect(36, 175, 540, 90, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 250, "REGULATORY COMPLIANCE & TARIFF ADVISORY (46 U.S.C. § 41104):")
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 236, "Federal Maritime Commission (FMC) Docket 21-08 prohibits carriers from assessing chassis split fees without")
    c.drawString(46, 224, "specific written authorization. Ocean Shipping Reform Act (OSRA 2022) rules require certified free-time clock dates.")

    c.line(46, 195, 260, 195)
    c.line(300, 195, 550, 195)

    c.setFont("Helvetica", 7)
    c.drawString(46, 185, "Carrier Authorized Billing Agent: Mediterranean Shipping Company")
    c.drawString(300, 185, "Pre-Audit Dispatch Center: Long Beach Intermodal Terminal")

    c.save()


def generate_nightmare_03(output_path: str):
    """
    nightmare_03_duty_drawback.pdf:
    Authentic CBP Form 7501 Entry Summary + Paired Export Bill of Lading.
    Unlocks 99% Duty Drawback under 19 U.S.C. § 1313 within 5-year statutory window.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Official CBP Header
    c.setStrokeColor(colors.HexColor("#14532D")) # Forest Green
    c.setFillColor(colors.HexColor("#14532D"))
    c.rect(36, 730, 540, 36, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(46, 748, "DEPARTMENT OF HOMELAND SECURITY • U.S. CUSTOMS AND BORDER PROTECTION")
    c.setFont("Helvetica", 8)
    c.drawString(46, 736, "ENTRY SUMMARY (CBP FORM 7501) • 19 U.S.C. § 1313 DUTY DRAWBACK SUBMISSION")

    # CBP Form 7501 Blocks Grid
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 620, 540, 102, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 706, "1. ENTRY NUMBER:")
    c.drawString(46, 692, "2. ENTRY TYPE:")
    c.drawString(46, 678, "6. PORT CODE:")
    c.drawString(46, 664, "7. ENTRY DATE:")
    c.drawString(46, 650, "8. IMPORTING CARRIER:")
    c.drawString(46, 636, "10. LIQUIDATION DATE:")

    c.setFont("Helvetica", 8)
    c.drawString(150, 706, "2704-8921473-1")
    c.drawString(150, 692, "01 (Consumption Entry)")
    c.drawString(150, 678, "2704 (Los Angeles / Long Beach)")
    c.drawString(150, 664, "January 14, 2024")
    c.drawString(150, 650, "CMA CGM CORTE REAL (Voyage 092W)")
    c.drawString(150, 636, "February 28, 2024 (Timely Under 5-Year § 1313(r))")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(320, 706, "11. IMPORTER OF RECORD:")
    c.drawString(320, 664, "12. BOND NUMBER:")

    c.setFont("Helvetica", 8)
    c.drawString(320, 694, "Pacific Crest Electronics Inc.")
    c.drawString(320, 684, "IRS EIN: 95-4819283-00")
    c.drawString(320, 674, "500 OceanGate, Long Beach, CA 90802")
    c.drawString(320, 652, "Continuous Surety Bond: US-BND-771829")
    c.drawString(320, 642, "Surety Code: 994 • Limit: $500,000.00")

    # Tariff Classification & Duty Paid Grid (Blocks 27 - 39)
    data = [
        ["Line", "28. Description of Merchandise", "29. HTS No.", "31. Entered Value", "32. Duty Rate", "33. Duty Paid"],
        ["001", "High-Density Solid-State Memory Modules\nNAND Flash Storage Arrays (Industrial Grade)", "8471.70.4065", "$200,000.00", "10.00%", "$20,000.00"],
    ]

    table = Table(data, colWidths=[35, 220, 95, 75, 55, 60])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#14532D")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))

    table.wrapOn(c, 540, 100)
    table.drawOn(c, 36, 520)

    # Paired Export Document (Bill of Lading Matching) Box
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(36, 345, 540, 160, fill=1, stroke=1)

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 490, "PAIRED EXPORT TRANSACTION RECORD (19 U.S.C. § 1313(j)(1) UNUSED MERCHANDISE):")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 472, "Export Ocean Carrier:")
    c.drawString(46, 458, "Export Bill of Lading No:")
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

def generate_all_nightmares():
    out_dir = get_nightmares_dir()
    generate_nightmare_01(os.path.join(out_dir, "nightmare_01_customs_ci.pdf"))
    generate_nightmare_02(os.path.join(out_dir, "nightmare_02_freight_audit.pdf"))
    generate_nightmare_03(os.path.join(out_dir, "nightmare_03_duty_drawback.pdf"))
    print(f"Generated 3 authentic trade PDF documents in: {out_dir}")

if __name__ == "__main__":
    generate_all_nightmares()
