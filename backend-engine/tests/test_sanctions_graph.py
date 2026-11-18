from fastapi.testclient import TestClient

from app.services.sanctions_screener import sanctions_screener
from main import app

client = TestClient(app)

def test_global_micro_electronics_ofac_50_percent_rule():
    """
    Verifies that Global Micro Electronics Ltd (bis-el-cn-0941) is blocked under
    the OFAC 50 Percent Rule via aggregated beneficial ownership:
    Victor Petrov (25%) + Rosoboronexport JSC (30%) = 55% >= 50%.
    """
    graph_resp = sanctions_screener.get_ownership_graph("bis-el-cn-0941")
    eval_res = graph_resp.evaluation

    assert eval_res.target_entity_id == "bis-el-cn-0941"
    assert eval_res.total_blocked_ownership_pct == 55.0
    assert eval_res.is_blocked_by_50_percent_rule is True
    assert eval_res.compliance_action == "BLOCK_AND_REPORT"
    assert len(eval_res.blocking_entities) == 2
    
    # Verify nodes and edges
    assert len(graph_resp.nodes) == 4
    assert len(graph_resp.edges) == 3

def test_apex_ocean_logistics_controlling_interest():
    """
    Verifies that Apex Ocean Logistics Inc is blocked under OFAC SDN and
    65% controlling interest by IRISL.
    """
    graph_resp = sanctions_screener.get_ownership_graph("ofac-sdn-ir-0382")
    eval_res = graph_resp.evaluation

    assert eval_res.target_entity_id == "ofac-sdn-ir-0382"
    assert eval_res.total_blocked_ownership_pct == 65.0
    assert eval_res.is_blocked_by_50_percent_rule is True
    assert eval_res.direct_sdn_status is True
    assert eval_res.compliance_action == "BLOCK_AND_REPORT"
    assert len(eval_res.blocking_entities) == 1
    assert "Islamic Republic of Iran Shipping Lines" in eval_res.blocking_entities[0]["owner_name"]

def test_pacific_apex_clean_consignee():
    """
    Verifies that a clean domestic entity (pacific-apex-01) receives a clean clearance
    with 0% blocked beneficial ownership.
    """
    graph_resp = sanctions_screener.get_ownership_graph("pacific-apex-01")
    eval_res = graph_resp.evaluation

    assert eval_res.total_blocked_ownership_pct == 0.0
    assert eval_res.is_blocked_by_50_percent_rule is False
    assert eval_res.direct_sdn_status is False
    assert eval_res.compliance_action == "CLEAR_TRANSACTION"
    assert len(eval_res.blocking_entities) == 0

def test_sanctions_graph_api_endpoint():
    """
    Tests GET /api/v1/sanctions/graph/{entity_id} endpoint contract.
    """
    response = client.get("/api/v1/sanctions/graph/bis-el-cn-0941")
    assert response.status_code == 200
    data = response.json()

    assert data["target_id"] == "bis-el-cn-0941"
    assert "nodes" in data
    assert "edges" in data
    assert "evaluation" in data
    assert data["evaluation"]["total_blocked_ownership_pct"] == 55.0
    assert data["evaluation"]["is_blocked_by_50_percent_rule"] is True


def test_unknown_entity_fails_closed_in_ownership_graph():
    """
    C5 Requirement: Unknown entity IDs must fail closed to COMPLIANCE_HOLD and
    REQUIRES_MANUAL_REVIEW, never CLEAR_TRANSACTION.
    """
    graph_resp = sanctions_screener.get_ownership_graph("completely-unknown-foreign-entity-999")
    eval_res = graph_resp.evaluation

    assert eval_res.target_entity_id == "completely-unknown-foreign-entity-999"
    assert eval_res.compliance_action == "REQUIRES_MANUAL_REVIEW"
    assert eval_res.compliance_action != "CLEAR_TRANSACTION"
    assert graph_resp.nodes[0].risk_level == "COMPLIANCE_HOLD"


def test_faq401_example1_direct_sdn_blocked():
    """OFAC FAQ 401: Entity directly listed on SDN list is 100% blocked."""
    resp = sanctions_screener.get_ownership_graph("node-petrov")
    assert resp.evaluation.direct_sdn_status is True
    assert resp.evaluation.compliance_action == "BLOCK_AND_REPORT"


def test_faq401_example2_majority_blocked_owner():
    """OFAC FAQ 401: 60% owned by SDN entity (Petrov) -> blocked by operation of law."""
    resp = sanctions_screener.get_ownership_graph("nordic-titan-holdings")
    assert resp.evaluation.total_blocked_ownership_pct == 60.0
    assert resp.evaluation.is_blocked_by_50_percent_rule is True
    assert resp.evaluation.compliance_action == "BLOCK_AND_REPORT"


def test_faq401_example3_nonblocked_intermediary_passes_zero():
    """
    OFAC FAQ 401: Near-threshold 48.5% owned target (baltic-semiconductor-485).
    Since 48.5% < 50%, target is NOT blocked, and 0% cascades downstream.
    """
    resp = sanctions_screener.get_ownership_graph("baltic-semiconductor-485")
    assert resp.evaluation.total_blocked_ownership_pct == 48.5
    assert resp.evaluation.is_blocked_by_50_percent_rule is False
    assert resp.evaluation.compliance_action == "ENHANCED_DUE_DILIGENCE"


def test_faq401_example4_multiple_blocked_owners_aggregate():
    """
    OFAC FAQ 401: Aggregate ownership by multiple blocked persons:
    Victor Petrov (25%) + Rosoboronexport (30%) = 55% -> Blocked.
    """
    resp = sanctions_screener.get_ownership_graph("bis-el-cn-0941")
    assert resp.evaluation.total_blocked_ownership_pct == 55.0
    assert resp.evaluation.is_blocked_by_50_percent_rule is True
    assert resp.evaluation.compliance_action == "BLOCK_AND_REPORT"


def test_faq401_cycle_termination():
    """Circular holding (cyprus-holding-alpha <-> beta) must terminate safely without infinite recursion."""
    resp = sanctions_screener.get_ownership_graph("cyprus-holding-alpha")
    assert resp.evaluation.total_blocked_ownership_pct == 0.0
    assert resp.evaluation.is_blocked_by_50_percent_rule is False
    assert resp.evaluation.compliance_action == "CLEAR_TRANSACTION"


def test_concept_4_sanctions_unknown_entity_quarantined():
    """
    C5 Requirement: Auditing concept_4_sanctions with an unknown entity must fail closed
    to QUARANTINED with a compliance hold finding, never RELEASED.
    """
    from app.services.extractor import extractor_service
    res = extractor_service.run_audit("concept_4_sanctions", custom_payload={"entity_id": "unknown-corp-999"})
    assert res.quarantine_status == "QUARANTINED"
    assert len(res.discrepancies) == 1
    assert "Hold" in res.discrepancies[0].title
    assert res.discrepancies[0].severity == "warning"
    assert res.discrepancies[0].confidence == 0.50


def test_fuzzy_matching_precision_upgrades():
    """
    M5: Tests multi-scorer RapidFuzz improvements (token_sort, token_set, partial, suffix stripping).
    """
    # Name variation with suffix differences
    m1 = sanctions_screener.match_entity("Rosoboron Export", threshold=85.0)
    assert m1.matched is True
    assert m1.entity_id == "node-rosoboron"
    assert m1.match_score >= 85.0

    # Abbreviation variation
    m2 = sanctions_screener.match_entity("Islamic Rep. of Iran Shipping", threshold=85.0)
    assert m2.matched is True
    assert m2.entity_id == "node-irisl"
    assert m2.match_score >= 85.0

    # Clean unrelated entity must NOT match
    m3 = sanctions_screener.match_entity("Pacific Apex Computing Systems", threshold=85.0)
    assert m3.matched is False

