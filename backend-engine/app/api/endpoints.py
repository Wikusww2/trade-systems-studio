import asyncio
import hashlib
import os
import tempfile
import time
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.api.deps import get_extractor_service
from app.core.config import settings
from app.models.hts_models import ClassificationRequest, HTSClassificationResult
from app.models.sanctions_graph import CorporateGraphResponse
from app.models.schemas import (
    AuditResult,
    KillShotMetrics,
    LeadCaptureRequest,
    TelemetryEvent,
)
from app.models.valuation_models import AssistItem, EntryValuationAudit, PriorDisclosurePackage
from app.services.cargowise_xml import cargowise_xml_generator
from app.services.extractor import NIGHTMARE_GROUND_TRUTH, TradeDocumentExtractor
from app.services.hts_classifier import HTSClassifierEngine
from app.services.layout_extractor import layout_extractor
from app.services.lead_store import lead_store
from app.services.sanctions_screener import ScreeningReport, sanctions_screener
from app.services.valuation_ledger import CustomsValuationService

router = APIRouter()

# In-memory storage with bounded capacity fallback for leads & telemetry when Supabase is not configured
MAX_LEADS_CAPACITY = 1000
MAX_TELEMETRY_CAPACITY = 5000
IN_MEMORY_LEADS: list[dict] = []
IN_MEMORY_TELEMETRY: list[dict] = []

# Sliding-window rate limiters per client IP with bounded memory & TTL eviction (H5)
class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter tracking client requests per minute,
    bounded by MAX_TRACKED_IPS with automatic stale-IP TTL eviction.
    """
    MAX_TRACKED_IPS = 10_000

    def __init__(self, requests_per_minute: int = 60, max_tracked_ips: int = 10_000):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60.0
        self.max_tracked_ips = max_tracked_ips
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _evict_stale(self, cutoff: float) -> None:
        stale_ips = [ip for ip, ts in self._requests.items() if not ts or ts[-1] <= cutoff]
        for ip in stale_ips:
            del self._requests[ip]
        # If still at/above capacity after TTL purge, evict oldest-seen buckets
        if len(self._requests) >= self.max_tracked_ips:
            overflow = len(self._requests) - self.max_tracked_ips + 1
            oldest_ips = sorted(
                self._requests.keys(),
                key=lambda k: self._requests[k][-1] if self._requests[k] else 0.0,
            )[:overflow]
            for ip in oldest_ips:
                del self._requests[ip]

    def check(self, client_ip: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        if client_ip not in self._requests and len(self._requests) >= self.max_tracked_ips:
            self._evict_stale(cutoff)
        timestamps = [t for t in self._requests[client_ip] if t > cutoff]
        if len(timestamps) >= self.requests_per_minute:
            self._requests[client_ip] = timestamps
            return False
        timestamps.append(now)
        self._requests[client_ip] = timestamps
        return True

    def reset(self):
        self._requests.clear()

leads_rate_limiter = InMemoryRateLimiter(requests_per_minute=60)
telemetry_rate_limiter = InMemoryRateLimiter(requests_per_minute=300)
upload_rate_limiter = InMemoryRateLimiter(requests_per_minute=30)

MAX_LEAD_PAYLOAD_BYTES = 16 * 1024         # 16 KB
MAX_TELEMETRY_PAYLOAD_BYTES = 32 * 1024    # 32 KB
MAX_UPLOAD_PAYLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

async def check_lead_payload(request: Request):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_LEAD_PAYLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Payload size exceeds maximum allowed limit of {MAX_LEAD_PAYLOAD_BYTES} bytes."
                )
        except ValueError:
            pass
    body = await request.body()
    if len(body) > MAX_LEAD_PAYLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Payload size exceeds maximum allowed limit of {MAX_LEAD_PAYLOAD_BYTES} bytes."
        )
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not leads_rate_limiter.check(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for lead capture. Please try again shortly."
        )

async def check_telemetry_payload(request: Request):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_TELEMETRY_PAYLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Payload size exceeds maximum allowed limit of {MAX_TELEMETRY_PAYLOAD_BYTES} bytes."
                )
        except ValueError:
            pass
    body = await request.body()
    if len(body) > MAX_TELEMETRY_PAYLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Payload size exceeds maximum allowed limit of {MAX_TELEMETRY_PAYLOAD_BYTES} bytes."
        )
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not telemetry_rate_limiter.check(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for telemetry events. Please try again shortly."
        )

class SanctionsScreenRequest(BaseModel):
    shipper: Optional[str] = Field(default=None, description="Shipper / Exporter legal entity name")
    buyer: Optional[str] = Field(default=None, description="Buyer / Importer legal entity name")
    consignee: Optional[str] = Field(default=None, description="Consignee / Notify party legal entity name")
    threshold: float = Field(default=85.0, ge=50.0, le=100.0, description="Fuzzy match threshold percentage")

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "offline_mode": not bool(settings.GEMINI_API_KEY.strip()),
        "supabase_connected": bool(settings.SUPABASE_URL.strip()),
        "yente_configured": bool(settings.YENTE_API_URL.strip()),
    }

@router.get("/audit/{concept_id}", response_model=AuditResult)
async def get_audit(
    concept_id: str,
    extractor: TradeDocumentExtractor = Depends(get_extractor_service)
):
    if concept_id not in NIGHTMARE_GROUND_TRUTH:
        raise HTTPException(
            status_code=404,
            detail=f"Concept '{concept_id}' not found. Valid concepts: {list(NIGHTMARE_GROUND_TRUTH.keys())}"
        )
    # Wrap synchronous extractor run_audit in asyncio.to_thread so async workers are never blocked
    return await asyncio.to_thread(extractor.run_audit, concept_id)

@router.post("/audit/upload", response_model=AuditResult)
async def upload_audit_document(
    request: Request,
    file: UploadFile = File(...),
    extractor: TradeDocumentExtractor = Depends(get_extractor_service),
):
    """
    Accepts a real PDF document upload (max 5 MB), verifies %PDF- magic bytes,
    extracts layout tokens and structured trade fields via pdf_field_parser,
    and returns a fully calculated, deterministic AuditResult.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not upload_rate_limiter.check(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for document uploads. Please wait a moment."
        )

    # Check content length header if provided
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_UPLOAD_PAYLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Uploaded file exceeds maximum limit of {MAX_UPLOAD_PAYLOAD_BYTES // (1024 * 1024)} MB."
                )
        except ValueError:
            pass

    # Read file content safely
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_PAYLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Uploaded file exceeds maximum limit of {MAX_UPLOAD_PAYLOAD_BYTES // (1024 * 1024)} MB."
        )

    # Magic-byte verification: must start with %PDF-
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Uploaded file must be a valid PDF document with %PDF- header."
        )

    # Write to a temporary file for pypdf layout and field extraction
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
        tmp_pdf.write(contents)
        tmp_pdf_path = tmp_pdf.name

    try:
        from app.services.pdf_field_parser import parse_document
        parsed_doc = await asyncio.to_thread(parse_document, tmp_pdf_path)
        doc_type = parsed_doc.document_type
        payload = parsed_doc.payload
        bboxes = parsed_doc.bounding_boxes

        # Map document_type to concept scenario or custom execution
        if doc_type == "customs_invoice":
            concept_id = "concept_1_customs"
        elif doc_type == "freight_invoice":
            concept_id = "concept_2_freight"
        elif doc_type == "drawback_claim":
            concept_id = "concept_3_drawback"
        elif doc_type == "sanctions_dossier":
            concept_id = "concept_4_sanctions"
        else:
            concept_id = "concept_clean_fob"

        file_hash = hashlib.sha256(contents).hexdigest()[:12]

        # If document type is unrecognized / generic without trade fields, fail closed with Quarantine
        if doc_type in ("unknown", "generic_trade_document"):
            return AuditResult(
                concept_id="uploaded_custom_doc",
                title=f"Custom Upload: {file.filename or 'Document'}",
                subtitle="Unrecognized Document Structure • Mandatory Broker Review Required",
                document_filename=file.filename or "uploaded.pdf",
                document_url="",
                metrics=KillShotMetrics(
                    penalty_exposure_avoided=Decimal("0.00"),
                    carrier_overbilling_caught=Decimal("0.00"),
                    drawback_unclaimed_unlocked=Decimal("0.00"),
                ),
                discrepancies=[],
                extracted_data={"raw_status": "UNRECOGNIZED_DOCUMENT_TYPE"},
                offline_fallback_active=True,
                audit_run_id=f"RUN-2026-UPLOAD-{file_hash}",
                calc_version="2026.1.0",
                executed_at=datetime.now(timezone.utc).isoformat(),
                quarantine_status="QUARANTINED",
            )

        # Run audit on the parsed payload
        result = await asyncio.to_thread(extractor.run_audit, concept_id, payload)
        result.audit_run_id = f"RUN-2026-UPLOAD-{file_hash}"
        result.document_filename = file.filename or result.document_filename
        result.title = f"Uploaded Audit: {file.filename or result.title}"

        # Attach real parsed bounding boxes
        for d in result.discrepancies:
            for k, bb in bboxes.items():
                if k in d.id.lower() or k in d.title.lower():
                    d.bounding_box = bb
                    break

        return result
    finally:
        if os.path.exists(tmp_pdf_path):
            os.remove(tmp_pdf_path)

@router.get("/metrics", response_model=KillShotMetrics)
async def get_aggregate_metrics(
    extractor: TradeDocumentExtractor = Depends(get_extractor_service)
):
    # Non-blocking parallel gathering of concept audits
    c1, c2, c3 = await asyncio.gather(
        asyncio.to_thread(extractor.run_audit, "concept_1_customs"),
        asyncio.to_thread(extractor.run_audit, "concept_2_freight"),
        asyncio.to_thread(extractor.run_audit, "concept_3_drawback"),
    )

    return KillShotMetrics(
        penalty_exposure_avoided=c1.metrics.penalty_exposure_avoided,
        carrier_overbilling_caught=c2.metrics.carrier_overbilling_caught,
        drawback_unclaimed_unlocked=c3.metrics.drawback_unclaimed_unlocked
    )

@router.get("/documents/{filename}")
def get_document(filename: str):
    safe_name = os.path.basename(filename)
    filepath = os.path.join(settings.NIGHTMARES_DIR, safe_name)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Document fixture not found")
        
    return FileResponse(filepath, media_type="application/pdf", filename=safe_name)

@router.post("/layout/extract")
async def extract_document_layout(filename: str = Query(..., description="Target PDF filename in nightmares dir")):
    """
    Extracts layout bounding boxes using local docling/pypdf parser.
    Synchronous document conversion is executed inside asyncio.to_thread() to avoid blocking workers.
    """
    safe_name = os.path.basename(filename)
    filepath = os.path.join(settings.NIGHTMARES_DIR, safe_name)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Document fixture '{safe_name}' not found")

    boxes = await layout_extractor.extract_bounding_boxes_async(filepath)
    return {
        "filename": safe_name,
        "box_count": len(boxes),
        "bounding_boxes": boxes,
        "coordinate_space": "[0, 1000)"
    }

@router.post("/sanctions/screen", response_model=ScreeningReport)
async def screen_sanctions(request: SanctionsScreenRequest):
    """
    Screens trade entities against high-risk OpenSanctions dataset using rapidfuzz token_sort_ratio
    with optional YENTE_API_URL resolution. Synchronous fuzzy matching runs in worker thread.
    """
    return await sanctions_screener.screen_parties_async(
        shipper=request.shipper,
        buyer=request.buyer,
        consignee=request.consignee,
        threshold=request.threshold
    )

@router.get("/sanctions/graph/{entity_id}", response_model=CorporateGraphResponse)
async def get_sanctions_ownership_graph(entity_id: str):
    """
    Traverses multi-hop corporate ownership tree and evaluates OFAC 50 Percent Rule.
    """
    return await sanctions_screener.get_ownership_graph_async(entity_id)

@router.post("/leads", dependencies=[Depends(check_lead_payload)])
def capture_lead(lead: LeadCaptureRequest):
    record = lead.model_dump()
    persisted = lead_store.save_lead(record)
    if len(IN_MEMORY_LEADS) >= MAX_LEADS_CAPACITY:
        IN_MEMORY_LEADS.pop(0)
    IN_MEMORY_LEADS.append(record)
    return {
        "status": "success",
        "message": "Lead received for 25-invoice diagnostic audit",
        "lead_id": persisted["lead_id"],
        "storage": persisted["storage"],
        "offline_storage": persisted["offline_storage"],
    }

@router.post("/telemetry", dependencies=[Depends(check_telemetry_payload)])
def record_telemetry(event: TelemetryEvent):
    payload = event.model_dump()
    if len(IN_MEMORY_TELEMETRY) >= MAX_TELEMETRY_CAPACITY:
        IN_MEMORY_TELEMETRY.pop(0)
    IN_MEMORY_TELEMETRY.append(payload)
    return {
        "status": "success",
        "event_id": f"evt_{len(IN_MEMORY_TELEMETRY)}"
    }

# -------------------------------------------------------------
# Pillar 3: Autonomous HTS Classification Copilot & Landed Cost
# -------------------------------------------------------------
hts_classifier = HTSClassifierEngine()

@router.post("/hts/classify", response_model=HTSClassificationResult)
async def classify_product_hts(request: ClassificationRequest):
    """
    Classify product using WCO GRI 1-6 path-dependent hierarchical state machine
    with element-wise confidence scoring and Python Decimal landed cost calculations.
    """
    return await asyncio.to_thread(hts_classifier.classify, request)

@router.get("/hts/preset/{preset_id}", response_model=HTSClassificationResult)
async def get_hts_preset(preset_id: str, entered_value: Decimal = Query(Decimal("25000.00"))):
    """
    Retrieve pre-computed high-fidelity WCO GRI classification tree for a preset merchandise item.
    """
    return await asyncio.to_thread(hts_classifier.get_preset, preset_id, entered_value)

# -------------------------------------------------------------
# Pillar 4: CBP Assist & Valuation Register (19 CFR § 152.103)
# -------------------------------------------------------------
valuation_service = CustomsValuationService()

class ValuationAuditRequest(BaseModel):
    entry_number: str = "CBP-7501-84920184"
    importer_of_record: str = "Pacific Tech Imports LLC (EIN 94-8291048)"
    declared_transaction_value: Decimal = Decimal("450000.00")
    duty_rate_ad_valorem: Decimal = Decimal("0.054")
    current_entry_units: int = 15000
    invoice_incoterm: str = "CIF Los Angeles"
    international_freight_in_invoice: Decimal = Decimal("24500.00")
    marine_insurance_in_invoice: Decimal = Decimal("3200.00")
    months_elapsed: int = 9

class CargoWiseExportRequest(BaseModel):
    shipment_id: str = "S00001000"
    declaration_id: str = "B00001000"
    port_origin_code: str = "ZADUR"
    port_origin_name: str = "Durban"
    port_dest_code: str = "NLRTM"
    port_dest_name: str = "Rotterdam"
    invoice_number: str = "CI-2026-01"
    incoterm: str = "CIF"
    invoice_amount: Decimal = Decimal("148500.00")
    insurance_amount: Decimal = Decimal("1450.00")

@router.post("/export/cargowise-xml")
async def export_cargowise_xml_endpoint(request: CargoWiseExportRequest):
    """
    Generates schema-compliant CargoWise One eAdaptor UniversalShipment XML payload
    (version 1.1) with explicit DataContext and DataTarget routing.
    """
    from fastapi.responses import Response

    from app.services.cargowise_xml import cargowise_exporter

    xml_content = await asyncio.to_thread(
        cargowise_exporter.generate_universal_interchange_xml,
        shipment_id=request.shipment_id,
        declaration_id=request.declaration_id,
        port_origin_code=request.port_origin_code,
        port_origin_name=request.port_origin_name,
        port_dest_code=request.port_dest_code,
        port_dest_name=request.port_dest_name,
        invoice_number=request.invoice_number,
        incoterm=request.incoterm,
        invoice_amount=request.invoice_amount,
        insurance_amount=request.insurance_amount,
    )
    return Response(content=xml_content, media_type="application/xml")

@router.get("/scenarios")
async def get_scenarios():
    """Returns the 3 pre-loaded trade corridor scenarios."""
    return [
        {
            "id": "scenario_durban_rotterdam",
            "name": "Port of Durban to Rotterdam Electronics Shipment",
            "corridor": "ZADUR -> NLRTM",
            "risk_type": "CIF Marine Insurance Omission & GRI 3(b) Reclassification",
            "statute": "EU Union Customs Code (Regulation (EU) No 952/2013) & WCO GRI 3(b)",
            "default_exposure_usd": "36000.00",
        },
        {
            "id": "scenario_long_beach_battery",
            "name": "Trans-Pacific to Long Beach Lithium-Ion Battery Pack",
            "corridor": "CNSZX -> USLAX",
            "risk_type": "Section 301 Secondary Tariff & Chassis Split Surcharge",
            "statute": "19 U.S.C. § 1592 & FMC Docket 21-08",
            "default_exposure_usd": "48200.00",
        },
        {
            "id": "scenario_steel_drawback",
            "name": "Cross-Border Steel Assembly Duty Drawback",
            "corridor": "KRINC -> USHOU",
            "risk_type": "Unclaimed 99% Section 1313 Duty Drawback",
            "statute": "19 U.S.C. § 1313",
            "default_exposure_usd": "18400.00",
        }
    ]

@router.get("/valuation/ledger", response_model=list[AssistItem])
async def get_valuation_assist_ledger():
    """
    Returns the active GAAP assist register with amortized costs and unamortized balances.
    """
    return valuation_service.DEFAULT_ASSISTS

@router.post("/valuation/audit-entry", response_model=EntryValuationAudit)
async def audit_entry_valuation_endpoint(request: ValuationAuditRequest):
    """
    Audits an entry declaration for statutory assist omissions (19 U.S.C. § 1401a)
    and CIF freight deduction errors under 19 CFR § 152.103.
    """
    return await asyncio.to_thread(
        valuation_service.audit_entry_valuation,
        entry_number=request.entry_number,
        importer_of_record=request.importer_of_record,
        declared_transaction_value=request.declared_transaction_value,
        duty_rate_ad_valorem=request.duty_rate_ad_valorem,
        current_entry_units=request.current_entry_units,
        invoice_incoterm=request.invoice_incoterm,
        international_freight_in_invoice=request.international_freight_in_invoice,
        marine_insurance_in_invoice=request.marine_insurance_in_invoice,
        months_elapsed=request.months_elapsed,
    )

@router.post("/valuation/prior-disclosure", response_model=PriorDisclosurePackage)
async def generate_prior_disclosure_endpoint(request: ValuationAuditRequest):
    """
    Generates a formal 19 CFR § 162.74 Prior Disclosure package mitigating 19 U.S.C. § 1592
    civil penalties down to statutory interest only.
    """
    audit = await asyncio.to_thread(
        valuation_service.audit_entry_valuation,
        entry_number=request.entry_number,
        importer_of_record=request.importer_of_record,
        declared_transaction_value=request.declared_transaction_value,
        duty_rate_ad_valorem=request.duty_rate_ad_valorem,
        current_entry_units=request.current_entry_units,
        invoice_incoterm=request.invoice_incoterm,
        international_freight_in_invoice=request.international_freight_in_invoice,
        marine_insurance_in_invoice=request.marine_insurance_in_invoice,
        months_elapsed=request.months_elapsed,
    )
    return await asyncio.to_thread(valuation_service.generate_prior_disclosure, audit)

@router.get("/cargowise/export/{concept_id}")
async def export_cargowise_xml_by_concept_endpoint(concept_id: str):
    """
    Exports audited trade data formatted as WiseTech CargoWise UniversalShipment XML (v1.1)
    with pre-ingest verification tokens and diff annotations.
    """
    return cargowise_xml_generator.generate_diff_payload(concept_id)


