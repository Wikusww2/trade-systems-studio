from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, field_serializer, ConfigDict

class BoundingBox(BaseModel):
    """
    Normalized bounding box coordinates in [0, 1000) space.
    x: distance from left border [0, 1000)
    y: distance from top border [0, 1000)
    width: box width [0, 1000)
    height: box height [0, 1000)
    page_number: 1-indexed document page
    confidence: element-wise extraction confidence [0.0, 1.0]
    """
    x: float = Field(..., ge=0.0, le=1000.0, description="Normalized X coordinate [0, 1000)")
    y: float = Field(..., ge=0.0, le=1000.0, description="Normalized Y coordinate [0, 1000)")
    width: float = Field(..., ge=0.0, le=1000.0, description="Normalized width [0, 1000)")
    height: float = Field(..., ge=0.0, le=1000.0, description="Normalized height [0, 1000)")
    page_number: int = Field(default=1, ge=1, description="1-based page number")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Extraction confidence score [0.0, 1.0]")

    @field_validator("confidence")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, float(v)))

class Discrepancy(BaseModel):
    """
    Audit discrepancy flag with statutory legal grounding, deterministic exposure amount,
    and visual bounding box overlay.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique discrepancy identifier")
    concept_id: str = Field(..., description="Concept key: concept_1_customs | concept_2_freight | concept_3_drawback")
    title: str = Field(..., description="Short executive title")
    description: str = Field(..., description="Detailed audit finding with statutory rationale")
    statutory_code: str = Field(..., description="Legal authority (e.g. 19 U.S.C. § 1592, 19 CFR § 152.103)")
    severity: str = Field(..., description="Severity level: critical | warning | info | opportunity")
    exposure_amount: Decimal = Field(..., description="Deterministic financial exposure or recovery in USD")
    confidence: float = Field(default=0.98, ge=0.0, le=1.0, description="Confidence of finding")
    bounding_box: BoundingBox = Field(..., description="Normalized document coordinates for visual highlighting")
    executive_summary: Optional[str] = Field(default=None, description="Plain English executive impact summary")
    financial_blast_radius: Optional[str] = Field(default=None, description="Direct calculation of financial exposure vs interest mitigation")
    statutory_defense: Optional[str] = Field(default=None, description="Recommended legal and architectural remediation protocol")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional structured parameters")

    @field_serializer("exposure_amount")
    def serialize_decimal(self, v: Decimal) -> float:
        return float(v)

class KillShotMetrics(BaseModel):
    """
    Executive Kill Shot metrics displayed in high-contrast crimson and emerald cards.
    """
    model_config = ConfigDict(from_attributes=True)

    penalty_exposure_avoided: Decimal = Field(default=Decimal("0.00"), description="19 U.S.C. § 1592 penalty exposure avoided")
    carrier_overbilling_caught: Decimal = Field(default=Decimal("0.00"), description="Carrier logistics overcharges intercepted")
    drawback_unclaimed_unlocked: Decimal = Field(default=Decimal("0.00"), description="Statutory 99% CBP duty refunds unlocked")

    @field_serializer("penalty_exposure_avoided", "carrier_overbilling_caught", "drawback_unclaimed_unlocked")
    def serialize_decimal(self, v: Decimal) -> float:
        return float(v)

class AuditResult(BaseModel):
    """
    Complete audit result payload for a specific concept, with immutable provenance
    and multi-tenant engagement policy snapshot per ADR-001 and ADR-004.
    """
    model_config = ConfigDict(from_attributes=True)

    concept_id: str
    title: str
    subtitle: str
    document_filename: str
    document_url: str
    metrics: KillShotMetrics
    discrepancies: List[Discrepancy]
    extracted_data: Dict[str, Any]
    offline_fallback_active: bool = False
    audit_run_id: str = Field(default="RUN-2026-USC1592-PROV", description="Content-addressed deterministic audit identifier")
    calc_version: str = Field(default="2026.1.0", description="Semantic statutory kernel calculation version")
    executed_at: Optional[str] = Field(default=None, description="ISO 8601 UTC execution timestamp")
    quarantine_status: Optional[str] = Field(default=None, description="QUARANTINED | RELEASED | ESCALATED")
    engagement_policy: Dict[str, Any] = Field(
        default_factory=lambda: {
            "policy_id": "DEFAULT-FORWARDER-TIER-1",
            "auto_hold_threshold_usd": 10000.0,
            "commercial_freight_tolerance_usd": 25.0,
            "statutory_floor_enforced": True,
            "fmc_free_time_days": 4,
            "assist_amortization_method": "first_entry_lump_sum"
        },
        description="Active tenant policy tolerances (strictly bounded by statutory floor)"
    )

class LeadCaptureRequest(BaseModel):
    email: str
    company_name: str
    phone: Optional[str] = None
    monthly_import_volume: Optional[str] = None
    source: str = "conversion_modal"

class TelemetryEvent(BaseModel):
    event_type: str
    concept_id: Optional[str] = None
    discrepancy_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
