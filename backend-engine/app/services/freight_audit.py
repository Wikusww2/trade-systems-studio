from decimal import Decimal
from typing import Any, Dict, List, Tuple

from app.models.schemas import BoundingBox, Discrepancy, KillShotMetrics
from app.services.utils import quantize_currency, safe_decimal


def audit_freight_bill(data: Dict[str, Any]) -> Tuple[KillShotMetrics, List[Discrepancy]]:
    """
    Performs deterministic pre-payment audit on carrier freight bill:
    1. Unauthorized Chassis Split Surcharge (no authorized work order)
    2. Inflated Fuel Surcharge (FSC markup above published EIA benchmark)
    3. Detention / Demurrage billed inside tariff Port Free Time window (FMC 46 CFR § 545.5)
    """
    # Empty input / missing core fields contract (C2):
    # If data is empty or missing required freight fields, return zero discrepancies and $0.00 metrics.
    if not data or not any(k in data for k in ("base_freight", "billed_fsc_rate", "chassis_split_fee", "detention_billed", "freight_charges", "invoice_number")):
        return KillShotMetrics(), []

    discrepancies: List[Discrepancy] = []
    total_overbilling = Decimal("0.00")

    # 1. Fuel Surcharge (FSC) Markup Check
    base_freight = safe_decimal(data.get("base_freight"), "0.00")
    billed_fsc_rate = safe_decimal(data.get("billed_fsc_rate"), "0.00")
    authorized_fsc_rate = safe_decimal(data.get("authorized_fsc_rate"), "0.00")
    
    billed_fsc_amount = quantize_currency(base_freight * billed_fsc_rate)
    lawful_fsc_amount = quantize_currency(base_freight * authorized_fsc_rate)
    fsc_overcharge = billed_fsc_amount - lawful_fsc_amount

    if fsc_overcharge > Decimal("0.00"):
        total_overbilling += fsc_overcharge
        discrepancies.append(
            Discrepancy(
                id="disc-c2-01",
                concept_id="concept_2_freight",
                title="Inflated Fuel Surcharge (FSC) Index Markup",
                description=f"Carrier billed FSC at {billed_fsc_rate * 100:.2f}% (${billed_fsc_amount:,.2f}) exceeding the authorized DOE/EIA West Coast weekly diesel index contract cap of {authorized_fsc_rate * 100:.2f}% (${lawful_fsc_amount:,.2f}). Overbill intercepted: ${fsc_overcharge:,.2f}.",
                statutory_code="Contract Tariff Rule 22 / EIA Index",
                severity="critical",
                exposure_amount=fsc_overcharge,
                confidence=0.98,
                executive_summary=f"Carrier billed FSC at {billed_fsc_rate * 100:.1f}% vs authorized weekly EIA diesel index cap of {authorized_fsc_rate * 100:.1f}%, silently extracting ${fsc_overcharge:,.2f} overcharge.",
                financial_blast_radius=f"Direct systemic overcharge: ${fsc_overcharge:,.2f} on single 40' HC bill.",
                statutory_defense="Automated EDI pre-audit invoice dispute deduction before ACH treasury disbursement.",
                bounding_box=BoundingBox(
                    x=58.0,
                    y=385.0,
                    width=880.0,
                    height=45.0,
                    page_number=1,
                    confidence=0.98
                ),
                metadata={
                    "billed_rate": f"{billed_fsc_rate * 100:.1f}%",
                    "contract_rate": f"{authorized_fsc_rate * 100:.1f}%",
                    "billed_fsc": str(billed_fsc_amount),
                    "lawful_fsc": str(lawful_fsc_amount),
                    "variance": str(fsc_overcharge)
                }
            )
        )

    # 2. Unauthorized Chassis Split Surcharge Check
    chassis_split = safe_decimal(data.get("chassis_split_fee"), "0.00")
    has_signed_work_order = bool(data.get("has_chassis_work_order", False))
    if chassis_split > Decimal("0.00") and not has_signed_work_order:
        total_overbilling += chassis_split
        discrepancies.append(
            Discrepancy(
                id="disc-c2-02",
                concept_id="concept_2_freight",
                title="Unauthorized Chassis Split Surcharge",
                description=f"Carrier assessed ${chassis_split:,.2f} for off-dock chassis repositioning without a signed Shipper Work Order or pre-dispatch agreement. Disallowed under Ocean Contract Terms Section 8.",
                statutory_code="UCC § 2-207 / Tariff Sec. 8",
                severity="warning",
                exposure_amount=chassis_split,
                confidence=0.94,
                executive_summary=f"Accessorial chassis split (${chassis_split:,.2f}) assessed without signed motor carrier interchange agreement under FMC Docket 21-08.",
                financial_blast_radius=f"${chassis_split:,.2f} unapproved auxiliary drayage surcharge.",
                statutory_defense="Disallow accessorial line item per FMC Docket 21-08 carrier charging guidelines.",
                bounding_box=BoundingBox(
                    x=58.0,
                    y=435.0,
                    width=880.0,
                    height=45.0,
                    page_number=1,
                    confidence=0.94
                ),
                metadata={
                    "charge_code": "ACC-SPLIT",
                    "billed_amount": str(chassis_split),
                    "authorization_present": False
                }
            )
        )

    # 3. Port Free Time Detention / Demurrage Check (FMC 46 CFR § 545.5)
    # Only evaluate detention when free-time parameters are explicitly provided
    free_days_val = data.get("port_free_days_allowed")
    actual_days_val = data.get("actual_days_held")
    detention_billed = safe_decimal(data.get("detention_billed"), "0.00")

    if free_days_val is not None and actual_days_val is not None:
        free_days = int(free_days_val)
        actual_days = int(actual_days_val)
        if actual_days <= free_days and detention_billed > Decimal("0.00"):
            total_overbilling += detention_billed
            discrepancies.append(
                Discrepancy(
                    id="disc-c2-03",
                    concept_id="concept_2_freight",
                    title="Unlawful Detention Billed Inside Port Free Time",
                    description=f"Carrier billed container detention (${detention_billed:,.2f}) on container. Gate out occurred on Day {actual_days} of {free_days} allowed business days. Violates FMC OSRA 46 CFR § 545.5.",
                    statutory_code="FMC 46 CFR § 545.5 (OSRA)",
                    severity="critical",
                    exposure_amount=detention_billed,
                    confidence=0.97,
                    executive_summary=f"Demurrage assessed despite in-gate pickup occurring on Day {actual_days} of terminal-mandated {free_days}-day free time window under OSRA 2022.",
                    financial_blast_radius=f"Illegal port detention penalty: ${detention_billed:,.2f}.",
                    statutory_defense="Invoke OSRA 2022 § 41104 mandatory billing dispute; carrier must produce certified terminal clock logs within 30 days.",
                    bounding_box=BoundingBox(
                        x=58.0,
                        y=485.0,
                        width=880.0,
                        height=45.0,
                        page_number=1,
                        confidence=0.97
                    ),
                    metadata={
                        "free_days_allowed": free_days,
                        "days_held": actual_days,
                        "illegal_detention": str(detention_billed)
                    }
                )
            )

    metrics = KillShotMetrics(
        penalty_exposure_avoided=Decimal("0.00"),
        carrier_overbilling_caught=quantize_currency(total_overbilling),
        drawback_unclaimed_unlocked=Decimal("0.00")
    )

    return metrics, discrepancies
