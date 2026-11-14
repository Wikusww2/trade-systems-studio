import pytest
from fastapi.testclient import TestClient
from main import app
from app.services.sanctions_screener import sanctions_screener

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
    assert eval_res.blocking_entities[0]["owner_name"] == "Islamic Republic of Iran Shipping Lines (IRISL)"

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
