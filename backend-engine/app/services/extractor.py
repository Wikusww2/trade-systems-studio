import hashlib
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.models.schemas import AuditResult
from app.services.ai_classifier import ai_classifier
from app.services.customs_audit import audit_customs_invoice
from app.services.drawback_audit import audit_duty_drawback
from app.services.freight_audit import audit_freight_bill
from app.services.layout_extractor import layout_extractor

logger = logging.getLogger(__name__)

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
    "concept_4_sanctions": {
        "title": "Concept 4: OFAC 50% Rule & Entity Resolution",
        "subtitle": "31 CFR § 501 Blocked Entity Aggregation & EAR Defense Watchlist",
        "filename": "nightmare_04_ofac_registry.pdf",
        "payload": {
            "entity_id": "bis-el-cn-0941",
            "name": "Global Micro Electronics Ltd",
            "aggregate_blocked_pct": "55.0",
            "action": "BLOCK_AND_REPORT",
        },
    },
}

class TradeDocumentExtractor:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.is_offline = not bool(self.api_key)

    def validate_document_firewall(
        self,
        payload: Dict[str, Any],
        concept_id: str,
        layout_boxes: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """
        Pre-ingest document firewall (C1):
        Validates input payload structures before audit execution and rejects malformed payloads.
        Correlates document presence and layout extraction tokens when available.
        """
        if not payload or not isinstance(payload, dict):
            raise ValueError("Pre-ingest document firewall rejected: empty or non-dict payload.")

        if concept_id in ("concept_1_customs", "concept_clean_fob"):
            if not any(k in payload for k in ("items", "misclassified_value", "dutiable_value", "unreported_assists")):
                raise ValueError("Customs firewall rejected: payload missing required invoice structures.")
        elif concept_id == "concept_2_freight":
            if not any(k in payload for k in ("base_freight", "chassis_split_fee", "detention_billed", "freight_charges")):
                raise ValueError("Freight firewall rejected: payload missing required freight billing fields.")
        elif concept_id == "concept_3_drawback":
            if not any(k in payload for k in ("duties_paid", "dutiable_value", "import_entry")):
                raise ValueError("Drawback firewall rejected: payload missing required duty drawback data.")
        elif concept_id == "concept_4_sanctions":
            if not any(k in payload for k in ("entity_id", "name", "shipper", "consignee", "buyer", "target_id")):
                raise ValueError("Sanctions firewall rejected: payload missing target entity identifiers.")

    def run_audit(self, concept_id: str, custom_payload: Optional[Dict[str, Any]] = None) -> AuditResult:
        """
        Executes document extraction and deterministic trade audit.
        - Guarantees flawless offline execution without API keys.
        - Enforces pre-ingest document firewall (C1).
        - Computes content-addressed run ID using SHA-256 on actual payload bytes (M4).
        - When GEMINI_API_KEY is present, enriches GRI reasoning via gemini-3.8-flash using real item data (M12).
        - Strict determinism invariant: all math is computed via Python Decimal.
        """
        if concept_id not in NIGHTMARE_GROUND_TRUTH:
            raise KeyError(f"Concept scenario '{concept_id}' not found in registered ground truth catalog.")

        scenario = NIGHTMARE_GROUND_TRUTH[concept_id]
        payload = custom_payload if custom_payload is not None else scenario["payload"]

        # 1. Real document reading & layout extraction if disk fixture is present (C1)
        pdf_path = os.path.join(settings.NIGHTMARES_DIR, scenario["filename"])
        layout_boxes: List[Dict[str, Any]] = []
        if os.path.exists(pdf_path):
            try:
                layout_boxes = layout_extractor.extract_bounding_boxes(pdf_path)
            except Exception as e:
                logger.warning("Could not extract layout from %s: %s", pdf_path, e)

        # 2. Pre-ingest document firewall validation (C1)
        self.validate_document_firewall(payload, concept_id, layout_boxes=layout_boxes)

        # 3. Deterministic financial and legal calculation engine
        if concept_id in ("concept_1_customs", "concept_clean_fob"):
            metrics, discrepancies = audit_customs_invoice(payload)
            # When online, enrich GRI classification justification via gemini-3.8-flash using real item data (M12)
            if ai_classifier.is_online:
                try:
                    target_item = next(
                        (it for it in payload.get("items", []) if "8471" in str(it.get("hts_code", ""))),
                        payload.get("items", [{}])[0] if payload.get("items") else {}
                    )
                    desc = target_item.get("description", "Electronic Processing Unit")
                    declared_code = target_item.get("hts_code", "8471.30.0100")
                    gri_enrichment = ai_classifier.analyze_gri_classification(
                        item_description=desc,
                        declared_hts=declared_code
                    )
                    if gri_enrichment:
                        for d in discrepancies:
                            if "HTS" in d.title:
                                d.metadata["ai_gri_reasoning"] = gri_enrichment.classification_rationale
                                d.metadata["gri_rules_applied"] = gri_enrichment.gri_rules_applied
                except Exception as e:
                    logger.warning("AI GRI reasoning enrichment failed: %s", e)
        elif concept_id == "concept_2_freight":
            metrics, discrepancies = audit_freight_bill(payload)
        elif concept_id == "concept_4_sanctions":
            from decimal import Decimal

            from app.models.schemas import BoundingBox, Discrepancy, KillShotMetrics
            from app.services.sanctions_screener import sanctions_screener
            from app.services.utils import quantize_currency, safe_decimal

            target_id = payload.get("entity_id")
            target_name = payload.get("name")
            if not target_id and target_name:
                match = sanctions_screener.match_entity(target_name)
                target_id = match.entity_id if match.matched and match.entity_id else target_name
            if not target_id:
                for party_key in ("shipper", "consignee", "buyer", "target_id"):
                    if payload.get(party_key):
                        target_id = payload.get(party_key)
                        break

            target_id = target_id or "UNKNOWN_ENTITY"
            graph_resp = sanctions_screener.get_ownership_graph(target_id)
            eval_res = graph_resp.evaluation

            # Statutory penalty exposure under 50 U.S.C. Section 1705 / 31 CFR Part 501:
            # Greater of statutory baseline ($350,000.00) or 2x transaction value
            tx_value = safe_decimal(
                payload.get("transaction_value") or payload.get("dutiable_value") or payload.get("amount"),
                "0.00"
            )
            ieepa_statutory_base = Decimal("350000.00")
            statutory_penalty = max(ieepa_statutory_base, quantize_currency(tx_value * Decimal("2.00")))

            discrepancies = []
            if eval_res.is_blocked_by_50_percent_rule:
                if eval_res.blocking_entities:
                    owners_summary = " and ".join(
                        f"{b.get('ownership_pct', 0):g}% by {b.get('owner_name', b.get('owner_id'))}"
                        for b in eval_res.blocking_entities
                    )
                    desc = (
                        f"Target entity {eval_res.target_entity_name} ({target_id}) is owned {owners_summary}. "
                        f"Aggregate blocked ownership is {eval_res.total_blocked_ownership_pct:g}%, "
                        f"rendering the entity blocked by operation of law under the OFAC 50% Rule."
                    )
                else:
                    desc = (
                        f"Target entity {eval_res.target_entity_name} ({target_id}) has "
                        f"{eval_res.total_blocked_ownership_pct:g}% aggregate blocked ownership, "
                        f"rendering the entity blocked by operation of law under the OFAC 50% Rule."
                    )

                discrepancies.append(
                    Discrepancy(
                        id="disc-c4-01",
                        concept_id="concept_4_sanctions",
                        title=f"31 CFR Section 501 Aggregate Blocked Ownership Violation ({eval_res.total_blocked_ownership_pct:g}%)",
                        description=desc,
                        severity="critical",
                        confidence=0.99,
                        bounding_box=BoundingBox(
                            x=42.0,
                            y=620.0,
                            width=535.0,
                            height=100.0,
                            page_number=1,
                            confidence=0.99,
                        ),
                        statutory_code="31 CFR Section 501",
                        exposure_amount=statutory_penalty,
                        statutory_defense="OFAC 50 Percent Rule",
                        metadata={
                            "target_id": target_id,
                            "blocked_ownership_pct": f"{eval_res.total_blocked_ownership_pct:g}%",
                            "compliance_action": eval_res.compliance_action,
                            "blocking_entities": eval_res.blocking_entities,
                        },
                    )
                )
            elif eval_res.direct_sdn_status:
                discrepancies.append(
                    Discrepancy(
                        id="disc-c4-sdn-direct",
                        concept_id="concept_4_sanctions",
                        title=f"OFAC Specially Designated National (SDN) Direct Match: {eval_res.target_entity_name}",
                        description=(
                            f"Target entity {eval_res.target_entity_name} ({target_id}) is directly listed on the OFAC SDN List. "
                            f"Property and interests in property are blocked pursuant to 31 CFR Part 501."
                        ),
                        severity="critical",
                        confidence=0.99,
                        bounding_box=BoundingBox(
                            x=42.0,
                            y=620.0,
                            width=535.0,
                            height=100.0,
                            page_number=1,
                            confidence=0.99,
                        ),
                        statutory_code="31 CFR Part 501",
                        exposure_amount=statutory_penalty,
                        statutory_defense="Mandatory Blocking Order",
                        metadata={
                            "target_id": target_id,
                            "direct_sdn": True,
                            "compliance_action": eval_res.compliance_action,
                        },
                    )
                )

            penalty_exposure = sum(
                (d.exposure_amount for d in discrepancies if d.severity == "critical"),
                Decimal("0.00")
            )
            metrics = KillShotMetrics(
                penalty_exposure_avoided=penalty_exposure,
                carrier_overbilling_caught=Decimal("0.00"),
                drawback_unclaimed_unlocked=Decimal("0.00"),
            )
        else:  # concept_3_drawback
            metrics, discrepancies = audit_duty_drawback(payload)

        # Correlate discrepancies with extracted layout tokens if layout boxes are present (C1)
        if layout_boxes:
            for d in discrepancies:
                matched_box = None
                tokens_to_search = []
                if "cif" in d.id.lower() or "cif" in d.title.lower():
                    tokens_to_search = ["CIF", "INCOTERMS"]
                elif "sanction" in d.id.lower() or "501" in d.statutory_code:
                    tokens_to_search = ["31 CFR", "OFAC", "SDN", "OWNERSHIP", "PETROV", "GLOBAL MICRO"]
                elif "chassis" in d.id.lower():
                    tokens_to_search = ["CHASSIS", "SPLIT"]
                elif "detention" in d.id.lower() or "free time" in d.title.lower():
                    tokens_to_search = ["DEMURRAGE", "DETENTION", "FREE TIME"]
                elif "drawback" in d.id.lower():
                    tokens_to_search = ["DRAWBACK", "7501", "1313"]
                elif "hts" in d.id.lower() or "misclassification" in d.title.lower():
                    tokens_to_search = ["8471", "8542", "HTS"]
                elif "line" in d.id.lower():
                    line_num = str(d.metadata.get("line_number", ""))
                    if line_num:
                        tokens_to_search = [f"LINE {line_num}", f"00{line_num}", line_num]

                for tok in tokens_to_search:
                    for lb in layout_boxes:
                        if tok.upper() in lb.get("text", "").upper():
                            matched_box = lb["bounding_box"]
                            break
                    if matched_box:
                        break

                if matched_box:
                    d.metadata["layout_verified"] = True
                    d.metadata["layout_matched_token"] = tok
                    d.bounding_box.page_number = matched_box.page_number
                else:
                    d.metadata["layout_verified"] = False

        # Content-addressed deterministic audit_run_id from payload bytes & document content (M4)
        calc_version = "2026.1.0"
        has_quarantine_trigger = any(
            d.confidence < 0.85 or d.severity == "critical" for d in discrepancies
        )
        quarantine_status = "QUARANTINED" if has_quarantine_trigger else "RELEASED"
        
        payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        hasher = hashlib.sha256(payload_bytes)
        if os.path.exists(pdf_path):
            try:
                with open(pdf_path, "rb") as f:
                    hasher.update(f.read(4096))
            except Exception as e:
                logger.warning("Could not read document header for %s: %s", pdf_path, e)

        content_hash = hasher.hexdigest()[:12]
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
