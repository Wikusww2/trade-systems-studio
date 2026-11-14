import os
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import rapidfuzz.fuzz
import httpx
from app.core.config import settings

class SanctionsEntity(BaseModel):
    """
    OpenSanctions / yente compatible entity model.
    """
    id: str = Field(description="Unique entity identifier (e.g. OFAC SDN or BIS ID)")
    schema_type: str = Field(default="LegalEntity", description="OpenSanctions schema type (e.g. LegalEntity, Company)")
    name: str = Field(description="Canonical entity legal name")
    aliases: List[str] = Field(default_factory=list, description="Known aliases, trading names, and acronyms")
    country: List[str] = Field(default_factory=list, description="ISO 3166-1 alpha-2 country codes")
    programs: List[str] = Field(default_factory=list, description="Sanctions and enforcement programs")
    topics: List[str] = Field(default_factory=list, description="OpenSanctions topics: sanction, export.control, military")
    description: Optional[str] = Field(default=None, description="Regulatory rationale or violation background")

class EntityMatch(BaseModel):
    """
    Screening match result for an individual party.
    """
    query_name: str
    matched: bool
    entity_id: Optional[str] = None
    matched_name: Optional[str] = None
    schema_type: Optional[str] = None
    match_score: float = Field(ge=0.0, le=100.0, default=0.0)
    programs: List[str] = Field(default_factory=list)
    country: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    screening_engine: str = "rapidfuzz_embedded"

class ScreeningReport(BaseModel):
    """
    Consolidated sanctions screening report for a trade transaction.
    """
    shipper: Optional[EntityMatch] = None
    buyer: Optional[EntityMatch] = None
    consignee: Optional[EntityMatch] = None
    total_matches: int = 0
    has_violations: bool = False
    highest_risk_score: float = 0.0
    engine_used: str = "rapidfuzz_embedded"

# Embedded high-risk sanctions / denied-party dataset (OpenSanctions yente format)
EMBEDDED_SANCTIONS_DATASET: List[Dict[str, Any]] = [
    {
        "id": "bis-el-cn-0941",
        "schema_type": "Company",
        "name": "Global Micro Electronics Ltd",
        "aliases": [
            "Global Micro Electronics Ltd, Shenzhen",
            "Shenzhen Global Microelectronics Defense Dynamics",
            "Global Micro IC Technology",
            "GME Shenzhen Electronics"
        ],
        "country": ["CN"],
        "programs": [
            "BIS Entity List (15 CFR Part 744, Supp. No. 4)",
            "U.S. Export Administration Regulations (EAR) Military End-User"
        ],
        "topics": ["sanction", "export.control", "military"],
        "description": "Restricted military end-user and prohibited semiconductor export entity under BIS."
    },
    {
        "id": "ofac-sdn-ir-0382",
        "schema_type": "Company",
        "name": "Apex Ocean Logistics Inc",
        "aliases": [
            "Apex Ocean Logistics Marine Services",
            "Apex Logistics Intermodal Corp",
            "APX Ocean Freight Line"
        ],
        "country": ["PA", "IR"],
        "programs": [
            "OFAC SDN (Specially Designated Nationals)",
            "E.O. 13846 / E.O. 13224 Maritime Watchlist"
        ],
        "topics": ["sanction", "maritime.risk"],
        "description": "Sanctioned front carrier engaged in deceptive maritime transport practices."
    },
    {
        "id": "ofac-sdn-ru-0112",
        "schema_type": "Company",
        "name": "Rosoboronexport Joint Stock Company",
        "aliases": ["Rosoboronexport", "JSC Rosoboronexport", "ROE Defense Exports"],
        "country": ["RU"],
        "programs": ["OFAC SDN", "EU Consolidated Financial Sanctions", "CAATSA Section 231"],
        "topics": ["sanction", "military"],
        "description": "Russian state defense export monopoly under full blocking sanctions."
    },
    {
        "id": "ofac-sdn-ir-0001",
        "schema_type": "Company",
        "name": "Islamic Republic of Iran Shipping Lines",
        "aliases": ["IRISL", "Iran Shipping Lines", "Hafiz Darya Shipping Lines"],
        "country": ["IR"],
        "programs": ["OFAC SDN", "UN Security Council Resolution 1929"],
        "topics": ["sanction", "transport"],
        "description": "National maritime carrier subject to comprehensive international secondary sanctions."
    },
    {
        "id": "bis-uvl-cn-5541",
        "schema_type": "Company",
        "name": "Wuhan Precision Instruments & Automation Corp",
        "aliases": ["Wuhan Precision Instruments", "WPI Automation Ltd"],
        "country": ["CN"],
        "programs": ["BIS Unverified List (UVL)", "EAR Entity Watchlist"],
        "topics": ["export.control", "dual.use"],
        "description": "Unverified end-user subject to mandatory BIS export license requirements."
    }
]

class SanctionsScreener:
    """
    High-performance entity screening engine using rapidfuzz token_sort_ratio
    with OpenSanctions yente schema compatibility and optional live yente API integration.
    """
    def __init__(self, yente_url: Optional[str] = None):
        self.yente_url = (yente_url or settings.YENTE_API_URL or "").strip().rstrip("/")
        self.entities: List[SanctionsEntity] = [
            SanctionsEntity(**entry) for entry in EMBEDDED_SANCTIONS_DATASET
        ]

    def match_entity(self, query_name: Optional[str], threshold: float = 85.0) -> EntityMatch:
        """
        Fuzzy matches entity query name against canonical names and aliases using rapidfuzz.
        Enforces strict threshold >= 85.0.
        """
        if not query_name or not query_name.strip():
            return EntityMatch(query_name="", matched=False)

        clean_query = query_name.strip()
        best_match: Optional[SanctionsEntity] = None
        best_score: float = 0.0
        best_candidate: Optional[str] = None

        for entity in self.entities:
            # Check canonical name
            candidates = [entity.name] + entity.aliases
            for cand in candidates:
                # rapidfuzz token_sort_ratio handles token reordering and punctuation
                score = float(rapidfuzz.fuzz.token_sort_ratio(clean_query, cand))
                if score > best_score:
                    best_score = score
                    best_match = entity
                    best_candidate = cand

        if best_match and best_score >= threshold:
            return EntityMatch(
                query_name=clean_query,
                matched=True,
                entity_id=best_match.id,
                matched_name=best_candidate or best_match.name,
                schema_type=best_match.schema_type,
                match_score=round(best_score, 2),
                programs=best_match.programs,
                country=best_match.country,
                topics=best_match.topics,
                screening_engine="rapidfuzz_embedded"
            )

        return EntityMatch(
            query_name=clean_query,
            matched=False,
            match_score=round(best_score, 2),
            screening_engine="rapidfuzz_embedded"
        )

    async def screen_via_yente_api(
        self,
        query_name: str,
        threshold: float = 85.0
    ) -> Optional[EntityMatch]:
        """
        Queries live yente instance (/match endpoint) if YENTE_API_URL is configured.
        Falls back gracefully if unreachable.
        """
        if not self.yente_url or not query_name.strip():
            return None

        endpoint = f"{self.yente_url}/match/default"
        payload = {
            "queries": {
                "q1": {
                    "schema": "LegalEntity",
                    "properties": {
                        "name": [query_name.strip()]
                    }
                }
            }
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(endpoint, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    responses = data.get("responses", {}).get("q1", {}).get("results", [])
                    if responses:
                        top = responses[0]
                        score = float(top.get("score", 0.0)) * 100.0  # yente returns 0.0 - 1.0
                        if score >= threshold:
                            props = top.get("properties", {})
                            return EntityMatch(
                                query_name=query_name,
                                matched=True,
                                entity_id=top.get("id"),
                                matched_name=(props.get("name") or [top.get("caption")])[0],
                                schema_type=top.get("schema", "LegalEntity"),
                                match_score=round(score, 2),
                                programs=props.get("program", []),
                                country=props.get("country", []),
                                topics=top.get("topics", []),
                                screening_engine="yente_api"
                            )
        except Exception:
            # Fall back to embedded engine without failure
            pass

        return None

    def screen_parties(
        self,
        shipper: Optional[str] = None,
        buyer: Optional[str] = None,
        consignee: Optional[str] = None,
        threshold: float = 85.0
    ) -> ScreeningReport:
        """
        Screens Shipper, Buyer, and Consignee entities against the sanctions database.
        """
        shipper_res = self.match_entity(shipper, threshold) if shipper else None
        buyer_res = self.match_entity(buyer, threshold) if buyer else None
        consignee_res = self.match_entity(consignee, threshold) if consignee else None

        matches = [m for m in [shipper_res, buyer_res, consignee_res] if m and m.matched]
        has_violations = len(matches) > 0
        highest_score = max([m.match_score for m in matches], default=0.0)

        return ScreeningReport(
            shipper=shipper_res,
            buyer=buyer_res,
            consignee=consignee_res,
            total_matches=len(matches),
            has_violations=has_violations,
            highest_risk_score=highest_score,
            engine_used="rapidfuzz_embedded"
        )

    async def screen_parties_async(
        self,
        shipper: Optional[str] = None,
        buyer: Optional[str] = None,
        consignee: Optional[str] = None,
        threshold: float = 85.0
    ) -> ScreeningReport:
        """
        Asynchronously screens trade parties, delegating CPU fuzzy matching to worker thread
        and checking live yente API if configured.
        """
        if self.yente_url:
            shipper_res = await self.screen_via_yente_api(shipper, threshold) if shipper else None
            buyer_res = await self.screen_via_yente_api(buyer, threshold) if buyer else None
            consignee_res = await self.screen_via_yente_api(consignee, threshold) if consignee else None

            # If yente succeeded for matched items, use them; otherwise fill with embedded
            if shipper and not shipper_res:
                shipper_res = await asyncio.to_thread(self.match_entity, shipper, threshold)
            if buyer and not buyer_res:
                buyer_res = await asyncio.to_thread(self.match_entity, buyer, threshold)
            if consignee and not consignee_res:
                consignee_res = await asyncio.to_thread(self.match_entity, consignee, threshold)

            matches = [m for m in [shipper_res, buyer_res, consignee_res] if m and m.matched]
            return ScreeningReport(
                shipper=shipper_res,
                buyer=buyer_res,
                consignee=consignee_res,
                total_matches=len(matches),
                has_violations=len(matches) > 0,
                highest_risk_score=max([m.match_score for m in matches], default=0.0),
                engine_used="yente_hybrid"
            )

        # Non-blocking CPU execution via asyncio.to_thread
        return await asyncio.to_thread(
            self.screen_parties,
            shipper=shipper,
            buyer=buyer,
            consignee=consignee,
            threshold=threshold
        )

sanctions_screener = SanctionsScreener()

