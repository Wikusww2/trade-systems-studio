import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional, Set

import httpx
import rapidfuzz.fuzz
from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.sanctions_graph import (
    CorporateGraphResponse,
    GraphEdge,
    GraphNode,
    OFAC50PercentEvaluation,
)

logger = logging.getLogger(__name__)


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

# Fixture networks for multi-hop corporate ownership graphs & OFAC 50% Rule traversal
CORPORATE_OWNERSHIP_NETWORKS: Dict[str, Dict[str, Any]] = {
    "bis-el-cn-0941": {
        "target": {
            "id": "bis-el-cn-0941",
            "label": "Global Micro Electronics Ltd",
            "country": "CN",
            "is_blocked": False,
            "risk_level": "EAR_EXPORT_RESTRICTION",
            "programs": ["BIS Entity List (15 CFR Part 744)", "EAR Military End-User"],
            "sanction_authority": "BIS",
            "notes": "Direct military end-user and prohibited semiconductor export entity under EAR; blocked under OFAC 50% Rule via 55% aggregated ownership."
        },
        "nodes": [
            {
                "id": "bis-el-cn-0941",
                "label": "Global Micro Electronics Ltd",
                "country": "CN",
                "is_blocked": False,
                "risk_level": "EAR_EXPORT_RESTRICTION",
                "programs": ["BIS Entity List", "EAR Military End-User"],
                "sanction_authority": "BIS"
            },
            {
                "id": "node-petrov",
                "label": "Victor Petrov (SDN Oligarch)",
                "country": "RU",
                "is_blocked": True,
                "risk_level": "SDN_BLOCKED",
                "programs": ["OFAC SDN (E.O. 14024)", "EU Regulation 269/2014"],
                "sanction_authority": "OFAC"
            },
            {
                "id": "node-rosoboron",
                "label": "Rosoboronexport JSC",
                "country": "RU",
                "is_blocked": True,
                "risk_level": "SDN_BLOCKED",
                "programs": ["OFAC SDN", "CAATSA Section 231"],
                "sanction_authority": "OFAC"
            },
            {
                "id": "node-shenzhen-adv",
                "label": "Shenzhen Advanced Components Ltd",
                "country": "CN",
                "is_blocked": False,
                "risk_level": "CLEAN_COMMERCIAL",
                "programs": [],
                "sanction_authority": None
            }
        ],
        "edges": [
            {
                "source_id": "node-petrov",
                "target_id": "bis-el-cn-0941",
                "ownership_pct": 25.0,
                "relationship_type": "BENEFICIAL_OWNER"
            },
            {
                "source_id": "node-rosoboron",
                "target_id": "bis-el-cn-0941",
                "ownership_pct": 30.0,
                "relationship_type": "EQUITY_HOLDING"
            },
            {
                "source_id": "node-shenzhen-adv",
                "target_id": "bis-el-cn-0941",
                "ownership_pct": 45.0,
                "relationship_type": "COMMERCIAL_SHAREHOLDER"
            }
        ]
    },
    "ofac-sdn-ir-0382": {
        "target": {
            "id": "ofac-sdn-ir-0382",
            "label": "Apex Ocean Logistics Inc",
            "country": "PA",
            "is_blocked": True,
            "risk_level": "SDN_BLOCKED",
            "programs": ["OFAC SDN (E.O. 13846)"],
            "sanction_authority": "OFAC",
            "notes": "Covert front carrier under comprehensive secondary sanctions."
        },
        "nodes": [
            {
                "id": "ofac-sdn-ir-0382",
                "label": "Apex Ocean Logistics Inc",
                "country": "PA",
                "is_blocked": True,
                "risk_level": "SDN_BLOCKED",
                "programs": ["OFAC SDN"],
                "sanction_authority": "OFAC"
            },
            {
                "id": "node-irisl",
                "label": "Islamic Republic of Iran Shipping Lines (IRISL)",
                "country": "IR",
                "is_blocked": True,
                "risk_level": "SDN_BLOCKED",
                "programs": ["OFAC SDN", "UNSCR 1929"],
                "sanction_authority": "OFAC"
            },
            {
                "id": "node-panama-trust",
                "label": "Panama Maritime Holding Trust",
                "country": "PA",
                "is_blocked": False,
                "risk_level": "HIGH_RISK_SHELL",
                "programs": [],
                "sanction_authority": None
            }
        ],
        "edges": [
            {
                "source_id": "node-irisl",
                "target_id": "ofac-sdn-ir-0382",
                "ownership_pct": 65.0,
                "relationship_type": "CONTROLLING_INTEREST"
            },
            {
                "source_id": "node-panama-trust",
                "target_id": "ofac-sdn-ir-0382",
                "ownership_pct": 35.0,
                "relationship_type": "NOMINEE_DIRECTOR"
            }
        ]
    },
    "pacific-apex-01": {
        "target": {
            "id": "pacific-apex-01",
            "label": "Pacific Apex Computing Systems Inc",
            "country": "US",
            "is_blocked": False,
            "risk_level": "CLEAN_COMMERCIAL",
            "programs": [],
            "sanction_authority": None,
            "notes": "Clean verified domestic enterprise consignee."
        },
        "nodes": [
            {
                "id": "pacific-apex-01",
                "label": "Pacific Apex Computing Systems Inc",
                "country": "US",
                "is_blocked": False,
                "risk_level": "CLEAN_COMMERCIAL",
                "programs": [],
                "sanction_authority": None
            },
            {
                "id": "node-us-holdings",
                "label": "Pacific Apex Holdings Corp",
                "country": "US",
                "is_blocked": False,
                "risk_level": "CLEAN_COMMERCIAL",
                "programs": [],
                "sanction_authority": None
            },
            {
                "id": "node-us-trust",
                "label": "California Enterprise Trust",
                "country": "US",
                "is_blocked": False,
                "risk_level": "CLEAN_COMMERCIAL",
                "programs": [],
                "sanction_authority": None
            }
        ],
        "edges": [
            {
                "source_id": "node-us-holdings",
                "target_id": "pacific-apex-01",
                "ownership_pct": 70.0,
                "relationship_type": "PARENT_HOLDING"
            },
            {
                "source_id": "node-us-trust",
                "target_id": "pacific-apex-01",
                "ownership_pct": 30.0,
                "relationship_type": "BENEFICIAL_OWNER"
            }
        ]
    }
}

class SanctionsScreener:
    """
    High-performance entity screening engine using rapidfuzz token_sort_ratio
    with OpenSanctions yente schema compatibility and optional live yente API integration.
    Loads real FollowTheMoney dataset from disk (yente_ofac_ftm.jsonl) with in-memory fallback.
    """
    def __init__(self, yente_url: Optional[str] = None):
        self.yente_url = (yente_url or settings.YENTE_API_URL or "").strip().rstrip("/")
        self.entities: List[SanctionsEntity] = self._load_entities()
        self.networks: Dict[str, Dict[str, Any]] = self._load_networks()

    def _load_entities(self) -> List[SanctionsEntity]:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        jsonl_path = os.path.join(current_dir, "../data/yente_ofac_ftm.jsonl")
        entities: List[SanctionsEntity] = []

        if os.path.exists(jsonl_path):
            try:
                with open(jsonl_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        rec = json.loads(line)
                        schema = rec.get("schema")
                        if schema in ("Company", "LegalEntity", "Person", "Vessel", "Organization"):
                            props = rec.get("properties", {})
                            name = (props.get("name") or [""])[0]
                            if name:
                                entities.append(
                                    SanctionsEntity(
                                        id=rec.get("id"),
                                        schema_type=schema,
                                        name=name,
                                        aliases=props.get("alias", []),
                                        country=props.get("country", []),
                                        programs=props.get("program", []),
                                        topics=props.get("topics", []),
                                        description=(props.get("description") or [None])[0],
                                    )
                                )
            except Exception as e:
                logger.warning("Failed to load yente_ofac_ftm.jsonl: %s", e)

        if not entities:
            entities = [SanctionsEntity(**entry) for entry in EMBEDDED_SANCTIONS_DATASET]
        return entities

    def _load_networks(self) -> Dict[str, Dict[str, Any]]:
        networks: Dict[str, Dict[str, Any]] = dict(CORPORATE_OWNERSHIP_NETWORKS)
        # Augment with additional scenario networks
        networks["baltic-semiconductor-485"] = {
            "target": {
                "id": "baltic-semiconductor-485",
                "label": "Baltic Semiconductor Fabrications OU",
                "country": "EE",
                "is_blocked": False,
                "risk_level": "CLEAN_COMMERCIAL",
                "programs": [],
                "sanction_authority": None,
                "notes": "Near-threshold 48.5% unblocked target under the OFAC 50% Rule."
            },
            "nodes": [
                {
                    "id": "baltic-semiconductor-485",
                    "label": "Baltic Semiconductor Fabrications OU",
                    "country": "EE",
                    "is_blocked": False,
                    "risk_level": "CLEAN_COMMERCIAL",
                    "programs": [],
                    "sanction_authority": None
                },
                {
                    "id": "node-ivan-volkov",
                    "label": "Ivan Volkov (SDN)",
                    "country": "RU",
                    "is_blocked": True,
                    "risk_level": "SDN_BLOCKED",
                    "programs": ["OFAC SDN (E.O. 14024)"],
                    "sanction_authority": "OFAC"
                },
                {
                    "id": "node-tallinn-venture",
                    "label": "Tallinn Venture Capital OU",
                    "country": "EE",
                    "is_blocked": False,
                    "risk_level": "CLEAN_COMMERCIAL",
                    "programs": [],
                    "sanction_authority": None
                }
            ],
            "edges": [
                {
                    "source_id": "node-ivan-volkov",
                    "target_id": "baltic-semiconductor-485",
                    "ownership_pct": 48.5,
                    "relationship_type": "BENEFICIAL_OWNER"
                },
                {
                    "source_id": "node-tallinn-venture",
                    "target_id": "baltic-semiconductor-485",
                    "ownership_pct": 51.5,
                    "relationship_type": "COMMERCIAL_SHAREHOLDER"
                }
            ]
        }
        networks["arctic-minerals-sub"] = {
            "target": {
                "id": "arctic-minerals-sub",
                "label": "Arctic Minerals Processing AS",
                "country": "NO",
                "is_blocked": False,
                "risk_level": "HIGH_RISK_INDIRECT",
                "programs": [],
                "sanction_authority": "OFAC",
                "notes": "Indirectly controlled by blocked oligarch Victor Petrov via Nordic Titan (60% * 90% = 54%)."
            },
            "nodes": [
                {
                    "id": "arctic-minerals-sub",
                    "label": "Arctic Minerals Processing AS",
                    "country": "NO",
                    "is_blocked": False,
                    "risk_level": "HIGH_RISK_INDIRECT",
                    "programs": []
                },
                {
                    "id": "nordic-titan-holdings",
                    "label": "Nordic Titan Holdings AS",
                    "country": "NO",
                    "is_blocked": True,
                    "risk_level": "SDN_BLOCKED",
                    "programs": ["OFAC 50% Rule Tier-1"]
                },
                {
                    "id": "node-petrov",
                    "label": "Victor Petrov (SDN Oligarch)",
                    "country": "RU",
                    "is_blocked": True,
                    "risk_level": "SDN_BLOCKED",
                    "programs": ["OFAC SDN (E.O. 14024)"]
                }
            ],
            "edges": [
                {
                    "source_id": "nordic-titan-holdings",
                    "target_id": "arctic-minerals-sub",
                    "ownership_pct": 90.0,
                    "relationship_type": "PARENT_HOLDING"
                },
                {
                    "source_id": "node-petrov",
                    "target_id": "nordic-titan-holdings",
                    "ownership_pct": 60.0,
                    "relationship_type": "CONTROLLING_INTEREST"
                }
            ]
        }
        networks["cyprus-holding-alpha"] = {
            "target": {
                "id": "cyprus-holding-alpha",
                "label": "Alpha Maritime Holdings Ltd",
                "country": "CY",
                "is_blocked": False,
                "risk_level": "HIGH_RISK_SHELL",
                "programs": []
            },
            "nodes": [
                {
                    "id": "cyprus-holding-alpha",
                    "label": "Alpha Maritime Holdings Ltd",
                    "country": "CY",
                    "is_blocked": False,
                    "risk_level": "HIGH_RISK_SHELL",
                    "programs": []
                },
                {
                    "id": "cyprus-holding-beta",
                    "label": "Beta Marine Investments Ltd",
                    "country": "CY",
                    "is_blocked": False,
                    "risk_level": "HIGH_RISK_SHELL",
                    "programs": []
                }
            ],
            "edges": [
                {
                    "source_id": "cyprus-holding-beta",
                    "target_id": "cyprus-holding-alpha",
                    "ownership_pct": 100.0,
                    "relationship_type": "CROSS_HOLDING"
                },
                {
                    "source_id": "cyprus-holding-alpha",
                    "target_id": "cyprus-holding-beta",
                    "ownership_pct": 100.0,
                    "relationship_type": "CROSS_HOLDING"
                }
            ]
        }
        return networks

    def calculate_effective_blocked_ownership(
        self,
        target_id: str,
        visited: Optional[Set[str]] = None,
        current_network: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Recursively calculates aggregate blocked ownership percentage under OFAC 50% Rule.
        Handles direct and multi-hop indirect equity holdings with cycle prevention.
        """
        is_root = visited is None
        if visited is None:
            visited = set()
        if target_id in visited:
            return 0.0
        visited.add(target_id)

        network = self.networks.get(target_id)
        if not network and current_network:
            node_ids = {n.get("id") for n in current_network.get("nodes", [])}
            if target_id in node_ids:
                network = current_network

        if not network:
            ent = next((e for e in self.entities if e.id == target_id), None)
            if ent and any("OFAC" in p or "SDN" in p or "sanction" in ent.topics for p in ent.programs):
                return 100.0
            return 0.0

        target_info = network.get("target", {})
        nodes = {n["id"]: n for n in network.get("nodes", [])}
        target_node = nodes.get(target_id) or target_info
        # For intermediate nodes (not root target being evaluated): if directly blocked, return 100.0
        if not is_root and target_node.get("is_blocked"):
            return 100.0

        edges = network.get("edges", [])

        total_blocked_pct = 0.0
        for edge in edges:
            if edge.get("target_id") == target_id:
                owner_id = edge.get("source_id")
                pct = float(edge.get("ownership_pct", 0.0))
                owner_node = nodes.get(owner_id, {})
                if owner_node.get("is_blocked"):
                    total_blocked_pct += pct
                else:
                    indirect_pct = self.calculate_effective_blocked_ownership(
                        owner_id, visited.copy(), current_network=network
                    )
                    if indirect_pct >= 50.0:
                        total_blocked_pct += pct

        return min(round(total_blocked_pct, 2), 100.0)

    def match_entity(self, query_name: Optional[str], threshold: float = 85.0) -> EntityMatch:
        """
        Fuzzy matches entity query name against canonical names and aliases using rapidfuzz.
        Uses normalized token matching to handle punctuation and casing variations strictly.
        """
        if not query_name or not query_name.strip():
            return EntityMatch(query_name="", matched=False)

        clean_query = query_name.strip()

        def _normalize_tokens(text: str) -> str:
            cleaned = re.sub(r"[,\.\(\)\-\–\/\"']", " ", text.lower())
            return " ".join(cleaned.split())

        norm_query = _normalize_tokens(clean_query)
        best_match: Optional[SanctionsEntity] = None
        best_score: float = 0.0
        best_candidate: Optional[str] = None

        for entity in self.entities:
            candidates = [entity.name] + entity.aliases
            for cand in candidates:
                raw_score = float(rapidfuzz.fuzz.token_sort_ratio(clean_query, cand))
                norm_score = float(rapidfuzz.fuzz.token_sort_ratio(norm_query, _normalize_tokens(cand)))
                score = max(raw_score, norm_score)
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
        Falls back gracefully if unreachable with structured logging (M12).
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
        except Exception as e:
            logger.warning("Yente API screening call failed, falling back to embedded screener: %s", e)

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

    def get_ownership_graph(self, target_id: str) -> CorporateGraphResponse:
        """
        Traverses corporate ownership graph and evaluates the OFAC 50% Rule.
        Performs cycle-safe transitive multi-hop traversal and fails closed on unknown entities (C5).
        Distinguishes BIS Entity List from OFAC property blocking (M5).
        """
        data = self.networks.get(target_id) or CORPORATE_OWNERSHIP_NETWORKS.get(target_id)
        if not data:
            match = next((e for e in self.entities if e.id == target_id), None)
            if not match:
                # C5: Fail closed on unknown entity! Never return CLEAR_TRANSACTION.
                return CorporateGraphResponse(
                    target_id=target_id,
                    nodes=[
                        GraphNode(
                            id=target_id,
                            label=target_id,
                            country="UNKNOWN",
                            is_blocked=False,
                            risk_level="COMPLIANCE_HOLD"
                        )
                    ],
                    edges=[],
                    evaluation=OFAC50PercentEvaluation(
                        target_entity_id=target_id,
                        target_entity_name=target_id,
                        total_blocked_ownership_pct=0.0,
                        is_blocked_by_50_percent_rule=False,
                        direct_sdn_status=False,
                        compliance_action="REQUIRES_MANUAL_REVIEW"
                    )
                )

            # Known entity in dataset without a pre-computed graph
            target_name = match.name
            is_ofac_sdn = any("OFAC" in p or "SDN" in p for p in match.programs)
            is_bis_el = any("BIS" in p or "EAR" in p for p in match.programs)

            if is_ofac_sdn:
                risk_level = "SDN_BLOCKED"
                compliance_action = "BLOCK_AND_REPORT"
                is_blocked = True
            elif is_bis_el:
                risk_level = "EAR_EXPORT_RESTRICTION"
                compliance_action = "LICENSE_REQUIRED_EAR"
                is_blocked = False
            else:
                risk_level = "CLEAN_COMMERCIAL"
                compliance_action = "CLEAR_TRANSACTION"
                is_blocked = False

            return CorporateGraphResponse(
                target_id=target_id,
                nodes=[
                    GraphNode(
                        id=target_id,
                        label=target_name,
                        country=match.country[0] if match.country else "UNKNOWN",
                        is_blocked=is_blocked,
                        risk_level=risk_level
                    )
                ],
                edges=[],
                evaluation=OFAC50PercentEvaluation(
                    target_entity_id=target_id,
                    target_entity_name=target_name,
                    total_blocked_ownership_pct=100.0 if is_blocked else 0.0,
                    is_blocked_by_50_percent_rule=is_blocked,
                    direct_sdn_status=is_ofac_sdn,
                    compliance_action=compliance_action
                )
            )

        nodes = [GraphNode(**n) for n in data["nodes"]]
        edges = [GraphEdge(**e) for e in data["edges"]]
        target_info = data["target"]
        node_lookup = {n.id: n for n in nodes}

        # Multi-hop transitive cycle-safe blocked ownership calculation (C5)
        blocked_ownership = self.calculate_effective_blocked_ownership(target_id)

        # Gather blocking entities (both direct and indirect owners with >=50% effective blocked interest)
        blocking_entities = []
        for edge in edges:
            if edge.target_id == target_id:
                owner = node_lookup.get(edge.source_id)
                if owner:
                    if owner.is_blocked:
                        blocking_entities.append({
                            "owner_id": owner.id,
                            "owner_name": owner.label,
                            "country": owner.country,
                            "ownership_pct": edge.ownership_pct,
                            "programs": owner.programs
                        })
                    else:
                        owner_effective = self.calculate_effective_blocked_ownership(owner.id)
                        if owner_effective >= 50.0:
                            blocking_entities.append({
                                "owner_id": owner.id,
                                "owner_name": owner.label,
                                "country": owner.country,
                                "ownership_pct": edge.ownership_pct,
                                "programs": owner.programs or ["OFAC 50% Rule Subsidiary (Indirect)"]
                            })

        direct_sdn = (target_info.get("sanction_authority") == "OFAC" or any("OFAC" in str(p) or "SDN" in str(p) for p in target_info.get("programs", []))) and target_info.get("is_blocked", False)
        is_blocked_50 = blocked_ownership >= 50.0

        if direct_sdn or is_blocked_50:
            action = "BLOCK_AND_REPORT"
        elif target_info.get("sanction_authority") == "BIS" or any("BIS" in str(p) or "EAR" in str(p) for p in target_info.get("programs", [])):
            action = "LICENSE_REQUIRED_EAR"
        elif blocked_ownership > 0.0:
            action = "ENHANCED_DUE_DILIGENCE"
        else:
            action = "CLEAR_TRANSACTION"

        evaluation = OFAC50PercentEvaluation(
            target_entity_id=target_id,
            target_entity_name=target_info["label"],
            total_blocked_ownership_pct=round(blocked_ownership, 2),
            is_blocked_by_50_percent_rule=is_blocked_50,
            direct_sdn_status=direct_sdn,
            blocking_entities=blocking_entities,
            compliance_action=action
        )

        return CorporateGraphResponse(
            target_id=target_id,
            nodes=nodes,
            edges=edges,
            evaluation=evaluation
        )

    async def get_ownership_graph_async(self, target_id: str) -> CorporateGraphResponse:
        """
        Asynchronously fetches ownership graph via worker thread.
        """
        return await asyncio.to_thread(self.get_ownership_graph, target_id)

sanctions_screener = SanctionsScreener()

