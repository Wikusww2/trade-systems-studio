from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str = Field(description="Unique node identifier")
    label: str = Field(description="Entity legal name or individual title")
    country: str = Field(default="UNKNOWN", description="ISO 3166-1 alpha-2 country code")
    is_blocked: bool = Field(default=False, description="Whether node itself is an explicit sanctioned SDN entity")
    risk_level: str = Field(
        default="CLEAN_COMMERCIAL",
        description="Risk classification: SDN_BLOCKED, HIGH_RISK_SHELL, CLEAN_COMMERCIAL, PEP"
    )
    programs: List[str] = Field(default_factory=list, description="Sanction programs (e.g. OFAC SDN, BIS UVL)")
    sanction_authority: Optional[str] = Field(default=None, description="Enforcement body (OFAC, BIS, EU, UN)")
    notes: Optional[str] = Field(default=None, description="Regulatory background notes")

class GraphEdge(BaseModel):
    source_id: str = Field(description="Owner / parent entity ID")
    target_id: str = Field(description="Owned entity ID")
    ownership_pct: float = Field(ge=0.0, le=100.0, description="Direct equity ownership percentage")
    relationship_type: str = Field(default="BENEFICIAL_OWNER", description="Relationship nature")

class OFAC50PercentEvaluation(BaseModel):
    target_entity_id: str
    target_entity_name: str
    total_blocked_ownership_pct: float = Field(ge=0.0, le=100.0)
    is_blocked_by_50_percent_rule: bool
    direct_sdn_status: bool
    statutory_citation: str = "31 CFR § 501 (OFAC 50 Percent Rule)"
    blocking_entities: List[Dict[str, Any]] = Field(default_factory=list)
    compliance_action: str = Field(
        description="Mandatory compliance directive: BLOCK_AND_REPORT, ENHANCED_DUE_DILIGENCE, CLEAR_TRANSACTION"
    )

class CorporateGraphResponse(BaseModel):
    target_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    evaluation: OFAC50PercentEvaluation
