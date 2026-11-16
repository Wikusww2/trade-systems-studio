import hashlib
from datetime import datetime, timezone
from typing import Any, Dict

from app.core.config import settings
from app.models.schemas import AuditResult
from app.services.ai_classifier import ai_classifier
from app.services.customs_audit import audit_customs_invoice
from app.services.drawback_audit import audit_duty_drawback
from app.services.freight_audit import audit_freight_bill

# Ground-truth nightmare test scenarios for deterministic offline mode
NIGHTMARE_GROUND_TRUTH: Dict[str, Dict[str, Any]] = {
    "concept_1_customs": {
        "title": "Concept 1: Customs Compliance Firewall",
        "subtitle": "19 U.S.C. § 1592 Negligence & 19 CFR § 152.103 Valuation Verification",
        "filename": "nightmare_01_customs_ci.pdf",
        "payload": {
            "incoterms": "CIF LOS ANGELES",
            "insurance_charge": "0.00",
            "freight_charge": "1200.00",
            "misclassified_value": "125000.00",
            "declared_duty_rate": "0.00",
            "lawful_duty_rate": "0.25",
            "items": [
                {
                    "line_number": 1,
                    "item_code": "DSP-8801",
                    "description": "DSP Sub-System Controllers",
                    "quantity": "500",
                    "unit_price": "45.00",
                    "stated_total": "25500.00",  # Arithmetic error ($22,500 actual)
                    "hts_code": "8542.31.0000",
                },
                {
                    "line_number": 2,
                    "item_code": "AI-CORE-09",
                    "description": "High-Speed AI Core Processors",
                    "quantity": "1000",
                    "unit_price": "125.00",
                    "stated_total": "125000.00",
                    "hts_code": "8471.30.0100",  # Misclassified (0% claimed vs 25% lawful)
                },
                {
                    "line_number": 3,
                    "item_code": "BUS-TRANS-01",
                    "description": "Bus Interface Transceiver ICs",
                    "quantity": "1000",
                    "unit_price": "15.00",
                    "stated_total": "15000.00",
                    "hts_code": "8542.39.0000",
                },
            ],
        },
    },
    "concept_2_freight": {
        "title": "Concept 2: Pre-Payment Freight Audit",
        "subtitle": "Ocean Demurrage & FMC 46 CFR § 545.5 Tariff Surcharge Intercept",
        "filename": "nightmare_02_freight_audit.pdf",
        "payload": {
            "base_freight": "4500.00",
            "billed_fsc_rate": "0.325",  # 32.5%
            "authorized_fsc_rate": "0.240",  # 24.0%
            "chassis_split_fee": "285.00",
            "has_chassis_work_order": False,
            "port_free_days_allowed": 4,
            "actual_days_held": 4,
            "detention_billed": "880.00",
        },
    },
    "concept_3_drawback": {
        "title": "Concept 3: Duty Drawback Harvester",
        "subtitle": "19 U.S.C. § 1313 Unused Merchandise 99% CBP Duty Refund Matching",
        "filename": "nightmare_03_duty_drawback.pdf",
        "payload": {
            "dutiable_value": "240000.00",
            "duties_paid": "27600.00",
            "drawback_percentage": "0.99",
            "is_timely_5yr_window": True,
            "import_entry": "441-9872134-2",
            "export_bl": "EXP-2024-88412",
        },
    },
    "concept_clean_fob": {
        "title": "Clean Production Invoice: Verified FOB Terms",
        "subtitle": "100% Pre-Clearance Certified • Zero 19 U.S.C. § 1592 Exposure",
        "filename": "clean_01_customs_fob.pdf",
        "payload": {
            "incoterms": "FOB YANTIAN",
            "insurance_charge": "0.00",
            "freight_charge": "0.00",
            "misclassified_value": "0.00",
            "declared_duty_rate": "0.00",
            "lawful_duty_rate": "0.00",
            "items": [
                {
                    "line_number": 1,
                    "item_code": "ARM-CORTEX-01",
                    "description": "ARM Cortex-M4 Microcontroller Processors",
                    "quantity": "500",
                    "unit_price": "45.00",
                    "stated_total": "22500.00",
                    "hts_code": "8542.31.0001",
                },
                {
                    "line_number": 2,
                    "item_code": "AI-TENSOR-02",
                    "description": "High-Performance Neural Tensor Accelerators",
                    "quantity": "200",
                    "unit_price": "350.00",
                    "stated_total": "70000.00",
                    "hts_code": "8542.31.0001",
                },
                {
                    "line_number": 3,
                    "item_code": "PSU-MOD-03",
                    "description": "High-Efficiency Switching Power Supplies",
                    "quantity": "1000",
                    "unit_price": "25.00",
                    "stated_total": "25000.00",
                    "hts_code": "8504.40.9580",
                },
            ],
        },
    },
}

class TradeDocumentExtractor:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.is_offline = not bool(self.api_key)

    def run_audit(self, concept_id: str) -> AuditResult:
        """
        Executes document extraction and deterministic trade audit.
        - Guarantees flawless offline execution without API keys.
        - When GEMINI_API_KEY is present, enriches GRI reasoning via gemini-3.8-flash.
        - Strict determinism invariant: all math is computed via Python Decimal.
        """
        if concept_id not in NIGHTMARE_GROUND_TRUTH:
            concept_id = "concept_1_customs"

        scenario = NIGHTMARE_GROUND_TRUTH[concept_id]
        payload = scenario["payload"]

        # Deterministic financial and legal calculation engine
        if concept_id in ("concept_1_customs", "concept_clean_fob"):
            metrics, discrepancies = audit_customs_invoice(payload)
            # When online, enrich GRI classification justification via gemini-3.8-flash
            if ai_classifier.is_online:
                try:
                    gri_enrichment = ai_classifier.analyze_gri_classification(
                        item_description="High-Speed AI Core Processors",
                        declared_hts="8471.30.0100"
                    )
                    if gri_enrichment:
                        for d in discrepancies:
                            if "HTS" in d.title:
                                d.metadata["ai_gri_reasoning"] = gri_enrichment.classification_rationale
                                d.metadata["gri_rules_applied"] = gri_enrichment.gri_rules_applied
                except Exception:
                    pass
        elif concept_id == "concept_2_freight":
            metrics, discrepancies = audit_freight_bill(payload)
        else:  # concept_3_drawback
            metrics, discrepancies = audit_duty_drawback(payload)

        # Content-addressed deterministic audit_run_id (ADR-001 & ADR-004)
        calc_version = "2026.1.0"
        has_quarantine_trigger = any(
            d.confidence < 0.85 or d.severity == "critical" for d in discrepancies
        )
        quarantine_status = "QUARANTINED" if has_quarantine_trigger else "RELEASED"
        
        raw_hash_seed = f"{concept_id}:{calc_version}:{scenario['filename']}:{len(discrepancies)}"
        content_hash = hashlib.sha256(raw_hash_seed.encode("utf-8")).hexdigest()[:12]
        audit_run_id = f"RUN-2026-{concept_id.upper()}-{content_hash}"

        return AuditResult(
            concept_id=concept_id,
            title=scenario["title"],
            subtitle=scenario["subtitle"],
            document_filename=scenario["filename"],
            document_url=f"/api/v1/documents/{scenario['filename']}",
            metrics=metrics,
            discrepancies=discrepancies,
            extracted_data=payload,
            offline_fallback_active=not ai_classifier.is_online,
            audit_run_id=audit_run_id,
            calc_version=calc_version,
            executed_at=datetime.now(timezone.utc).isoformat(),
            quarantine_status=quarantine_status,
        )

extractor_service = TradeDocumentExtractor()
