import os
import asyncio
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from app.api.deps import get_extractor_service
from app.services.extractor import TradeDocumentExtractor, NIGHTMARE_GROUND_TRUTH
from app.services.layout_extractor import layout_extractor
from app.services.sanctions_screener import sanctions_screener, ScreeningReport
from app.models.schemas import (
    AuditResult,
    KillShotMetrics,
    LeadCaptureRequest,
    TelemetryEvent,
)
from app.core.config import settings

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
