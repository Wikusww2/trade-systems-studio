"""HTS Classification and Landed Cost Pydantic v2 Models.

Enforces strict Decimal typing for statutory calculations and confidence scoring
for hierarchical WCO General Rules of Interpretation (GRI 1-6) reasoning.
"""

from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class GRIDecisionNode(BaseModel):
    """A single node in the WCO GRI hierarchical reasoning chain."""
    step_rule: str = Field(..., description="GRI Rule applied: GRI 1, GRI 2(a), GRI 3(b), GRI 6, etc.")
    heading_or_subheading: str = Field(..., description="Target HS Chapter, Heading, or Subheading code")
    description: str = Field(..., description="Statutory description of the tariff line")
    legal_rationale: str = Field(..., description="Statutory reasoning citing Section/Chapter Notes")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Inference confidence score [0.0, 1.0]")
    passed: bool = Field(True, description="Whether this classification branch was accepted")
    competing_candidates: List[str] = Field(default_factory=list, description="Alternative headings evaluated and eliminated")


class LandedCostBreakdown(BaseModel):
    """Deterministic customs duty, statutory fee, and landed cost calculation."""
    entered_value: Decimal = Field(..., description="FOB / Dutiable value of merchandise")
    duty_rate_ad_valorem: Decimal = Field(..., description="General duty rate percentage (e.g. 0.025 for 2.5%)")
    customs_duty: Decimal = Field(..., description="Calculated ad valorem customs duty")
    mpf_rate: Decimal = Field(Decimal("0.003464"), description="Merchandise Processing Fee statutory rate (0.3464%)")
    mpf_min_cap: Decimal = Field(Decimal("31.67"), description="Statutory MPF minimum fee cap")
    mpf_max_cap: Decimal = Field(Decimal("614.35"), description="Statutory MPF maximum fee cap")
    mpf_fee: Decimal = Field(..., description="Merchandise Processing Fee after statutory capping")
    hmf_rate: Decimal = Field(Decimal("0.00125"), description="Harbor Maintenance Fee rate (0.125%) for ocean freight")
    hmf_fee: Decimal = Field(..., description="Harbor Maintenance Fee amount")
    freight_and_insurance: Decimal = Field(Decimal("0.00"), description="International logistics overhead")
    total_customs_cost: Decimal = Field(..., description="Sum of Duty + MPF + HMF")
    total_landed_cost: Decimal = Field(..., description="Sum of Entered Value + Customs Costs + Logistics")


class HTSClassificationResult(BaseModel):
    """Complete statutory classification decision tree output."""
    item_id: str
    product_title: str
    input_description: str
    country_of_origin: str
    declared_hts_code: Optional[str] = None
    classified_hts_code: str = Field(..., description="10-digit Harmonized Tariff Schedule code")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall element-wise path confidence")
    requires_human_review: bool = Field(False, description="True if confidence < 0.85 (triggers dashed amber gating)")
    gri_path: List[GRIDecisionNode] = Field(..., description="Step-by-step WCO GRI reasoning path")
    chapter_notes_cited: List[str] = Field(default_factory=list, description="Exact Section and Chapter notes cited")
    landed_cost: LandedCostBreakdown


class ClassificationRequest(BaseModel):
    """Request payload for autonomous HTS classification."""
    product_title: str
    product_description: str
    commercial_attributes: Optional[str] = None
    country_of_origin: str = "CN"
    entered_value: Decimal = Field(Decimal("10000.00"), description="FOB invoice transaction value")
    is_ocean_freight: bool = True
    freight_and_insurance: Decimal = Field(Decimal("1200.00"), description="Freight and marine insurance")
    declared_hts_code: Optional[str] = None
