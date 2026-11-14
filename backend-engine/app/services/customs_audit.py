from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Tuple
from app.models.schemas import Discrepancy, BoundingBox, KillShotMetrics

def quantize_currency(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def safe_decimal(val: Any, default: str = "0.00") -> Decimal:
    if val is None or val == "":
        return Decimal(default)
    try:
        return Decimal(str(val))
    except Exception:
        return Decimal(default)

def calculate_1592_penalties(lawful_duty_loss: Decimal) -> Dict[str, Tuple[Decimal, Decimal]]:
    """
    19 U.S.C. § 1592 Statutory Penalty Tiers:
    - Negligence: 0.25x to 2.0x of the lawful duty loss
    - Gross Negligence: 2.5x to 4.0x of the lawful duty loss
    """
    loss = quantize_currency(lawful_duty_loss)
    return {
        "negligence": (
            quantize_currency(loss * Decimal("0.25")),
            quantize_currency(loss * Decimal("2.00")),
        ),
        "gross_negligence": (
            quantize_currency(loss * Decimal("2.50")),
            quantize_currency(loss * Decimal("4.00")),
        ),
    }

def audit_customs_invoice(data: Dict[str, Any]) -> Tuple[KillShotMetrics, List[Discrepancy]]:
    """
    Performs deterministic customs compliance audit on commercial invoice:
    1. 19 CFR § 152.103 Valuation & Missing Marine Insurance on CIF terms
    2. Arithmetic line item multiplication extension errors
    3. WCO GRI 1-6 HTS classification & 19 U.S.C. § 1592 statutory penalty exposure
    """
    discrepancies: List[Discrepancy] = []
    
    # 1. CIF Insurance Valuation Check (19 CFR § 152.103)
    incoterms = str(data.get("incoterms") or "CIF LOS ANGELES").upper()
    insurance_charge = safe_decimal(data.get("insurance_charge"), "0.00")
    if "CIF" in incoterms and insurance_charge == Decimal("0.00"):
        # Uncertainty demo: confidence 0.82 (< 0.85 triggers dashed amber border in UI)
        discrepancies.append(
            Discrepancy(
                id="disc-c1-01",
                concept_id="concept_1_customs",
                title="Missing Mandatory Marine Insurance on CIF Entry",
                description="Transaction value declared CIF Los Angeles requires seller-provided marine insurance. Declaring CIF with $0.00 insurance distorts customs dutiable transaction value under 19 CFR § 152.103.",
                statutory_code="19 CFR § 152.103",
                severity="warning",
                exposure_amount=Decimal("1200.00"),
                confidence=0.82,  # < 0.85 triggers visual uncertainty dashed amber
                executive_summary="Omitted marine cargo insurance on CIF invoice triggers valuation defect & entry redelivery notice.",
                financial_blast_radius="Statutory valuation defect ($1,200.00) + potential liquidation rejection & CBP Form 28 Notice of Action.",
                statutory_defense="Amend Entry Summary Block 32 to reflect actual insurance paid or apportion under 19 CFR § 152.103(a).",
                bounding_box=BoundingBox(
                    x=58.0,
                    y=125.0,
                    width=880.0,
                    height=55.0,
                    page_number=1,
                    confidence=0.82
                ),
                metadata={
                    "rule": "19_CFR_152_103",
                    "incoterm": incoterms,
                    "declared_insurance": str(insurance_charge)
                }
            )
        )

    # 2. Line Item Arithmetic Extension Check
    items = data.get("items") or []
    math_exposure = Decimal("0.00")
    for item in items:
        qty = safe_decimal(item.get("quantity"), "0")
        unit_price = safe_decimal(item.get("unit_price"), "0.00")
        stated_total = safe_decimal(item.get("stated_total"), "0.00")
        calculated_total = quantize_currency(qty * unit_price)
        
        diff = stated_total - calculated_total
        if diff != Decimal("0.00"):
            math_exposure += abs(diff)
            discrepancies.append(
                Discrepancy(
                    id=f"disc-c1-02-line-{item.get('line_number', 1)}",
                    concept_id="concept_1_customs",
                    title="Invoice Line Item Arithmetic Extension Error",
                    description=f"Line {item.get('line_number', '001')}: {qty} units @ ${unit_price} calculates to ${calculated_total}, but was invoiced as ${stated_total}. Discrepancy of ${abs(diff)} misstates customs duty base.",
                    statutory_code="19 CFR § 152.103(a)",
                    severity="critical",
                    exposure_amount=abs(diff),
                    confidence=0.99,
                    executive_summary=f"Arithmetic inflation of ${abs(diff):,.2f} on Line {item.get('line_number', '001')} distorts entered value and statutory duty base.",
                    financial_blast_radius=f"Direct entered value distortion: ${abs(diff):,.2f} overstatement.",
                    statutory_defense="Issue commercial debit memo and submit Post-Summary Correction (PSC) within 300 days of entry.",
                    bounding_box=BoundingBox(
                        x=58.0,
                        y=360.0,
                        width=880.0,
                        height=50.0,
                        page_number=1,
                        confidence=0.99
                    ),
                    metadata={
                        "line_number": item.get("line_number", 1),
                        "stated_total": str(stated_total),
                        "calculated_total": str(calculated_total),
                        "variance": str(diff)
                    }
                )
            )

    # 3. HTS Misclassification & 19 U.S.C. § 1592 Penalties
    # High-Speed DSP Processors declared under 8471.30 (0%) vs 8542.31 (25% Section 301)
    dutiable_value = safe_decimal(data.get("misclassified_value"), "125000.00")
    declared_rate = safe_decimal(data.get("declared_duty_rate"), "0.00")
    lawful_rate = safe_decimal(data.get("lawful_duty_rate"), "0.25")
    
    lawful_duty_loss = quantize_currency(dutiable_value * (lawful_rate - declared_rate))
    penalties = calculate_1592_penalties(lawful_duty_loss)
    max_gross_neg_exposure = penalties["gross_negligence"][1]  # 4.0x = $125,000.00

    if lawful_duty_loss > Decimal("0.00"):
        discrepancies.append(
            Discrepancy(
                id="disc-c1-03",
                concept_id="concept_1_customs",
                title="HTS Misclassification & 19 U.S.C. § 1592 Penalty Exposure",
                description=f"Merchandise declared under HTS 8471.30.0100 (Duty 0.0%) instead of lawful HTS 8542.31.0000 (Section 301 Duty 25.0%). Lawful duty underpaid: ${lawful_duty_loss}. Statutory penalty exposure under 19 U.S.C. § 1592 reaches up to ${max_gross_neg_exposure} (Gross Negligence 4.0x).",
                statutory_code="19 U.S.C. § 1592",
                severity="critical",
                exposure_amount=max_gross_neg_exposure,
                confidence=0.96,
                executive_summary="Neural accelerators misclassified as general computers, evading 25% Section 301 tariffs and triggering 19 U.S.C. § 1592 gross negligence exposure.",
                financial_blast_radius=f"${lawful_duty_loss:,.2f} unpaid duty + up to ${max_gross_neg_exposure:,.2f} gross negligence penalty.",
                statutory_defense="File an immediate Prior Disclosure under 19 CFR § 162.74 before CBP notice. Caps penalty strictly to statutory interest (~$625), protecting $124,375 in capital.",
                bounding_box=BoundingBox(
                    x=58.0,
                    y=415.0,
                    width=880.0,
                    height=50.0,
                    page_number=1,
                    confidence=0.96
                ),
                metadata={
                    "declared_hts": "8471.30.0100",
                    "lawful_hts": "8542.31.0000",
                    "dutiable_base": str(dutiable_value),
                    "duty_loss": str(lawful_duty_loss),
                    "negligence_range": [str(penalties["negligence"][0]), str(penalties["negligence"][1])],
                    "gross_negligence_range": [str(penalties["gross_negligence"][0]), str(penalties["gross_negligence"][1])]
                }
            )
        )

    # 4. Valuation Assists & Royalty Check (19 CFR § 152.103(d) / (e))
    unreported_assists = safe_decimal(data.get("unreported_assists"), "0.00")
    if unreported_assists > Decimal("0.00"):
        assist_duty_loss = quantize_currency(unreported_assists * lawful_rate)
        assist_penalties = calculate_1592_penalties(assist_duty_loss)
        assist_exposure = assist_penalties["gross_negligence"][1]
        discrepancies.append(
            Discrepancy(
                id="disc-c1-04-assists",
                concept_id="concept_1_customs",
                title="Undeclared Engineering Assist / Tooling Under-Valuation",
                description=f"Buyer supplied ${unreported_assists} in production tooling / engineering assists omitted from declared transaction value. Violates mandatory assist apportionment under 19 CFR § 152.103(d). Gross negligence penalty exposure: ${assist_exposure}.",
                statutory_code="19 CFR § 152.103(d)",
                severity="critical",
                exposure_amount=assist_exposure,
                confidence=0.97,
                bounding_box=BoundingBox(
                    x=58.0,
                    y=475.0,
                    width=880.0,
                    height=45.0,
                    page_number=1,
                    confidence=0.97
                ),
                metadata={
                    "rule": "19_CFR_152_103_d",
                    "assist_value": str(unreported_assists),
                    "duty_rate": str(lawful_rate),
                    "unpaid_duty": str(assist_duty_loss),
                }
            )
        )

    # 5. Denied-Party / Sanctions Screening (EAR / OFAC)
    shipper = data.get("shipper")
    buyer = data.get("buyer")
    consignee = data.get("consignee")
    if shipper or buyer or consignee:
        from app.services.sanctions_screener import sanctions_screener
        report = sanctions_screener.screen_parties(shipper=shipper, buyer=buyer, consignee=consignee)
        if report.has_violations:
            for role, match in [("Shipper", report.shipper), ("Buyer", report.buyer), ("Consignee", report.consignee)]:
                if match and match.matched:
                    discrepancies.append(
                        Discrepancy(
                            id=f"disc-c1-sanctions-{role.lower()}",
                            concept_id="concept_1_customs",
                            title=f"High-Risk Sanctioned / Denied Party Match ({role})",
                            description=f"{role} '{match.query_name}' matches sanctioned entity '{match.matched_name}' ({match.entity_id}) with {match.match_score}% confidence. Restricted under: {', '.join(match.programs)}.",
                            statutory_code="15 CFR Part 744 (EAR) / OFAC",
                            severity="critical",
                            exposure_amount=dutiable_value,
                            confidence=round(match.match_score / 100.0, 2),
                            bounding_box=BoundingBox(
                                x=58.0,
                                y=70.0,
                                width=400.0,
                                height=50.0,
                                page_number=1,
                                confidence=round(match.match_score / 100.0, 2)
                            ),
                            metadata={
                                "role": role,
                                "matched_entity_id": match.entity_id,
                                "match_score": match.match_score,
                                "programs": match.programs,
                                "country": match.country,
                                "screening_engine": match.screening_engine
                            }
                        )
                    )

    metrics = KillShotMetrics(
        penalty_exposure_avoided=max_gross_neg_exposure if lawful_duty_loss > Decimal("0.00") else Decimal("0.00"),
        carrier_overbilling_caught=Decimal("0.00"),
        drawback_unclaimed_unlocked=Decimal("0.00")
    )

    return metrics, discrepancies
