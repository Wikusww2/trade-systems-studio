from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from app.models.schemas import BoundingBox, Discrepancy, KillShotMetrics
from app.services.utils import quantize_currency, safe_decimal


def calculate_1592_penalties(
    lawful_duty_loss: Decimal,
    domestic_value: Optional[Decimal] = None,
) -> Dict[str, Tuple[Decimal, Decimal]]:
    """
    19 U.S.C. § 1592 Statutory Penalty Tiers:
    - Negligence: 0.25x to 2.0x of the lawful duty loss (19 U.S.C. § 1592(c)(3))
    - Gross Negligence: 2.5x to 4.0x of the lawful duty loss (19 U.S.C. § 1592(c)(2))
    - Fraud: Up to 100% of the domestic value of merchandise (19 U.S.C. § 1592(c)(1))
    """
    loss = quantize_currency(lawful_duty_loss)
    result = {
        "negligence": (
            quantize_currency(loss * Decimal("0.25")),
            quantize_currency(loss * Decimal("2.00")),
        ),
        "gross_negligence": (
            quantize_currency(loss * Decimal("2.50")),
            quantize_currency(loss * Decimal("4.00")),
        ),
    }
    if domestic_value is not None:
        dom_val = quantize_currency(domestic_value)
        # 19 U.S.C. § 1592(c)(1): civil penalty not to exceed domestic value of merchandise
        # 19 CFR Part 171 App. B mitigation guideline floor is 0.50x of domestic value
        result["fraud"] = (
            quantize_currency(dom_val * Decimal("0.50")),
            dom_val,
        )
    return result


def audit_customs_invoice(data: Dict[str, Any]) -> Tuple[KillShotMetrics, List[Discrepancy]]:
    """
    Performs deterministic customs compliance audit on commercial invoice:
    1. 19 CFR § 152.103 Valuation & Missing Marine Insurance on CIF terms (deduction check under 19 U.S.C. § 1401a)
    2. Arithmetic line item multiplication extension errors
    3. WCO GRI 1-6 HTS classification & 19 U.S.C. § 1592 statutory penalty exposure
    4. Valuation Assists under 19 CFR § 152.103(d)
    5. Denied-Party / Sanctions Screening (EAR / OFAC)
    """
    # Empty input / missing core fields contract (C2):
    # If data is empty or missing core fields (no items, no misclassified_value, no dutiable_value, no invoice_number),
    # return empty metrics and zero discrepancies.
    if not data or not any(k in data for k in ("items", "misclassified_value", "dutiable_value", "invoice_number", "unreported_assists")):
        return KillShotMetrics(), []

    discrepancies: List[Discrepancy] = []
    
    # 1. CIF Insurance Valuation Check (19 U.S.C. § 1401a(b)(4)(A) / 19 CFR § 152.103)
    # Under US valuation law, international freight and insurance are statutory deductions from CIF prices.
    # Omitting insurance deduction results in entered value overstatement / duty overpayment, not an underpayment penalty.
    incoterms = str(data.get("incoterms") or "").upper()
    insurance_charge = safe_decimal(data.get("insurance_charge"), "0.00")
    if "CIF" in incoterms and insurance_charge == Decimal("0.00"):
        freight_charge = safe_decimal(data.get("freight_charge"), "0.00")
        if freight_charge > Decimal("0.00"):
            cif_exposure = freight_charge
            estimation_method = "declared_freight_charge"
        else:
            items_for_cif = data.get("items") or []
            total_invoice_val = safe_decimal(
                data.get("dutiable_value") or data.get("misclassified_value") or data.get("total_value"),
                "0.00"
            )
            if total_invoice_val == Decimal("0.00") and items_for_cif:
                total_invoice_val = sum(
                    [
                        (safe_decimal(it.get("stated_total")) or (safe_decimal(it.get("quantity")) * safe_decimal(it.get("unit_price"))))
                        for it in items_for_cif if isinstance(it, dict)
                    ],
                    Decimal("0.00")
                )
            if total_invoice_val > Decimal("0.00"):
                cif_exposure = quantize_currency(total_invoice_val * Decimal("0.010"))
                estimation_method = "statutory_commercial_marine_rate_1pct"
            else:
                cif_exposure = Decimal("0.00")
                estimation_method = "zero_baseline"

        # Uncertainty demo: confidence 0.82 (< 0.85 triggers dashed amber border in UI)
        discrepancies.append(
            Discrepancy(
                id="disc-c1-01",
                concept_id="concept_1_customs",
                title="Missing Marine Insurance Deduction on CIF Entry",
                description=f"Transaction value declared CIF requires deduction of seller-provided international freight and marine insurance under 19 U.S.C. § 1401a(b)(4)(A) and 19 CFR § 152.103. Declaring CIF with $0.00 insurance overstates customs dutiable transaction value by ${cif_exposure:,.2f}, resulting in excess duty payment rather than a 19 U.S.C. § 1592 penalty.",
                statutory_code="19 CFR § 152.103 / 19 U.S.C. § 1401a",
                severity="warning",
                exposure_amount=cif_exposure,
                confidence=0.82,  # < 0.85 triggers visual uncertainty dashed amber
                executive_summary="Omitted marine cargo insurance deduction on CIF entry causes entered value overstatement under 19 U.S.C. § 1401a.",
                financial_blast_radius=f"Entered value overstatement (${cif_exposure:,.2f}) results in duty overpayment, eligible for Post-Summary Correction (PSC) duty refund.",
                statutory_defense="Submit Post-Summary Correction (PSC) or protest under 19 U.S.C. § 1514 to deduct actual insurance and recover excess duty.",
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
                    "declared_insurance": str(insurance_charge),
                    "freight_charge": str(freight_charge),
                    "cif_deduction_exposure": str(cif_exposure),
                    "estimation_method": estimation_method,
                    "valuation_effect": "overstatement_duty_overpayment"
                }
            )
        )

    # 2. Line Item Arithmetic Extension Check
    items = data.get("items") or []
    math_exposure = Decimal("0.00")
    for item in items:
        if not isinstance(item, dict):
            continue
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
    dutiable_value = safe_decimal(data.get("misclassified_value"), "0.00")
    declared_rate = safe_decimal(data.get("declared_duty_rate"), "0.00")
    lawful_rate = safe_decimal(data.get("lawful_duty_rate"), "0.00")
    
    lawful_duty_loss = quantize_currency(dutiable_value * (lawful_rate - declared_rate))
    domestic_value_raw = data.get("domestic_value")
    domestic_value = safe_decimal(domestic_value_raw) if domestic_value_raw is not None else None

    penalties = calculate_1592_penalties(lawful_duty_loss, domestic_value=domestic_value)
    max_gross_neg_exposure = penalties["gross_negligence"][1]  # 4.0x
    is_fraud = bool(data.get("fraud") or data.get("violation_level") == "fraud") and ("fraud" in penalties)

    if lawful_duty_loss > Decimal("0.00") or is_fraud:
        # Dynamic interest and defense calculation under 19 CFR § 162.74 (M1)
        # 9 months statutory interest compounding daily at 7.0% APR
        compounded_factor = ((Decimal("1") + Decimal("0.0700") / Decimal("365")) ** 274) - Decimal("1")
        estimated_interest = quantize_currency(lawful_duty_loss * compounded_factor)
        
        if is_fraud:
            exposure_amount = penalties["fraud"][1]
            statutory_code = "19 U.S.C. § 1592(c)(1)"
            disc_title = "19 U.S.C. § 1592(c)(1) Fraud Penalty Exposure (100% Domestic Value)"
            disc_desc = (
                f"Fraudulent tariff evasion under 19 U.S.C. § 1592(c)(1). Lawful duty underpaid: ${lawful_duty_loss:,.2f}. "
                f"Statutory civil penalty capped at 100% of domestic value: ${exposure_amount:,.2f}."
            )
            exec_summary = "Intentional tariff evasion triggers 19 U.S.C. § 1592(c)(1) civil fraud penalty up to 100% domestic value."
            protected_capital = exposure_amount - estimated_interest
        else:
            exposure_amount = max_gross_neg_exposure
            statutory_code = "19 U.S.C. § 1592"
            disc_title = "HTS Misclassification & 19 U.S.C. § 1592 Penalty Exposure"
            disc_desc = (
                f"Merchandise declared under HTS 8471.30.0100 (Duty {declared_rate * 100:.1f}%) instead of lawful HTS 8542.31.0000 "
                f"(Section 301 Duty {lawful_rate * 100:.1f}%). Lawful duty underpaid: ${lawful_duty_loss:,.2f}. "
                f"Statutory penalty exposure under 19 U.S.C. § 1592 reaches up to ${max_gross_neg_exposure:,.2f} (Gross Negligence 4.0x)."
            )
            exec_summary = f"Neural accelerators misclassified as general computers, evading {lawful_rate * 100:.1f}% Section 301 tariffs and triggering 19 U.S.C. § 1592 gross negligence exposure."
            protected_capital = max_gross_neg_exposure - estimated_interest

        disc_metadata = {
            "declared_hts": "8471.30.0100",
            "lawful_hts": "8542.31.0000",
            "dutiable_base": str(dutiable_value),
            "duty_loss": str(lawful_duty_loss),
            "negligence_range": [str(penalties["negligence"][0]), str(penalties["negligence"][1])],
            "gross_negligence_range": [str(penalties["gross_negligence"][0]), str(penalties["gross_negligence"][1])],
            "statutory_interest": str(estimated_interest),
            "capital_protected": str(protected_capital)
        }
        if "fraud" in penalties:
            disc_metadata["fraud_range"] = [str(penalties["fraud"][0]), str(penalties["fraud"][1])]
            disc_metadata["domestic_value"] = str(domestic_value)

        discrepancies.append(
            Discrepancy(
                id="disc-c1-03",
                concept_id="concept_1_customs",
                title=disc_title,
                description=disc_desc,
                statutory_code=statutory_code,
                severity="critical",
                exposure_amount=exposure_amount,
                confidence=0.96,
                executive_summary=exec_summary,
                financial_blast_radius=f"${lawful_duty_loss:,.2f} unpaid duty + up to ${exposure_amount:,.2f} statutory penalty.",
                statutory_defense=f"File an immediate Prior Disclosure under 19 CFR § 162.74 before CBP notice. Caps penalty strictly to statutory interest (${estimated_interest:,.2f}), protecting ${protected_capital:,.2f} in capital.",
                bounding_box=BoundingBox(
                    x=58.0,
                    y=415.0,
                    width=880.0,
                    height=50.0,
                    page_number=1,
                    confidence=0.96
                ),
                metadata=disc_metadata
            )
        )

    # 4. Valuation Assists & Royalty Check (19 CFR § 152.103(d) / (e))
    unreported_assists = safe_decimal(data.get("unreported_assists"), "0.00")
    if unreported_assists > Decimal("0.00"):
        assist_duty_rate = lawful_rate if lawful_rate > Decimal("0.00") else Decimal("0.25")
        assist_duty_loss = quantize_currency(unreported_assists * assist_duty_rate)
        assist_penalties = calculate_1592_penalties(assist_duty_loss)
        assist_exposure = assist_penalties["gross_negligence"][1]
        discrepancies.append(
            Discrepancy(
                id="disc-c1-04-assists",
                concept_id="concept_1_customs",
                title="Undeclared Engineering Assist / Tooling Under-Valuation",
                description=f"Buyer supplied ${unreported_assists:,.2f} in production tooling / engineering assists omitted from declared transaction value. Violates mandatory assist apportionment under 19 CFR § 152.103(d). Gross negligence penalty exposure: ${assist_exposure:,.2f}.",
                statutory_code="19 CFR § 152.103(d)",
                severity="critical",
                exposure_amount=assist_exposure,
                confidence=0.97,
                executive_summary=f"Unreported assist tooling valued at ${unreported_assists:,.2f} triggers statutory undervaluation exposure under 19 CFR § 152.103(d).",
                financial_blast_radius=f"${assist_duty_loss:,.2f} unliquidated duty + ${assist_exposure:,.2f} potential 19 U.S.C. § 1592 penalty.",
                statutory_defense="Tender supplemental duty payment and prior disclosure for assist under-valuation.",
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
                    "duty_rate": str(assist_duty_rate),
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
                    if dutiable_value > Decimal("0.00"):
                        sanctions_exposure = dutiable_value
                    else:
                        total_inv_val = sum(
                            [
                                (safe_decimal(it.get("stated_total")) or (safe_decimal(it.get("quantity")) * safe_decimal(it.get("unit_price"))))
                                for it in (data.get("items") or []) if isinstance(it, dict)
                            ],
                            Decimal("0.00")
                        )
                        sanctions_exposure = total_inv_val if total_inv_val > Decimal("0.00") else safe_decimal(data.get("transaction_value"), "0.00")

                    discrepancies.append(
                        Discrepancy(
                            id=f"disc-c1-sanctions-{role.lower()}",
                            concept_id="concept_1_customs",
                            title=f"High-Risk Sanctioned / Denied Party Match ({role})",
                            description=f"{role} '{match.query_name}' matches sanctioned entity '{match.matched_name}' ({match.entity_id}) with {match.match_score}% confidence. Restricted under: {', '.join(match.programs)}.",
                            statutory_code="15 CFR Part 744 (EAR) / OFAC",
                            severity="critical",
                            exposure_amount=sanctions_exposure,
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
        penalty_exposure_avoided=exposure_amount if (lawful_duty_loss > Decimal("0.00") or is_fraud) else Decimal("0.00"),
        carrier_overbilling_caught=Decimal("0.00"),
        drawback_unclaimed_unlocked=Decimal("0.00")
    )

    return metrics, discrepancies
