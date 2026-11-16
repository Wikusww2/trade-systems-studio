import asyncio
import os
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
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
from app.services.sanctions_screener import ScreeningReport, sanctions_screener
from app.services.valuation_ledger import CustomsValuationService

router = APIRouter()

# In-memory storage fallback for leads & telemetry when Supabase is not configured
IN_MEMORY_LEADS: list[dict] = []
IN_MEMORY_TELEMETRY: list[dict] = []

# Expose 'app' ASGI callable on endpoints module for uvicorn compatibility
class _ASGIAppProxy:
    async def __call__(self, scope, receive, send):
        from main import app as _root_app
        await _root_app(scope, receive, send)

app = _ASGIAppProxy()

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
        # Auto-generate if missing
        from app.services.fixture_generator import generate_all_nightmares
        generate_all_nightmares()
        
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

@router.post("/leads")
def capture_lead(lead: LeadCaptureRequest):
    record = lead.model_dump()
    IN_MEMORY_LEADS.append(record)
    return {
        "status": "success",
        "message": "Lead received for 25-invoice diagnostic audit",
        "lead_id": f"lead_{len(IN_MEMORY_LEADS)}",
        "offline_storage": True
    }

@router.post("/telemetry")
def record_telemetry(event: TelemetryEvent):
    payload = event.model_dump()
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
            "statute": "19 U.S.C. § 1592 & 19 CFR § 152.103",
            "default_exposure_usd": 36000.00,
        },
        {
            "id": "scenario_long_beach_battery",
            "name": "Trans-Pacific to Long Beach Lithium-Ion Battery Pack",
            "corridor": "CNSZX -> USLAX",
            "risk_type": "Section 301 Secondary Tariff & Chassis Split Surcharge",
            "statute": "19 U.S.C. § 1592 & FMC Docket 21-08",
            "default_exposure_usd": 48200.00,
        },
        {
            "id": "scenario_steel_drawback",
            "name": "Cross-Border Steel Assembly Duty Drawback",
            "corridor": "KRINC -> USHOU",
            "risk_type": "Unclaimed 99% Section 1313 Duty Drawback",
            "statute": "19 U.S.C. § 1313",
            "default_exposure_usd": 18400.00,
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


