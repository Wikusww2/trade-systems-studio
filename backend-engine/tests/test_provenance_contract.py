import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_audit_provenance_contract_and_quarantine():
    """
    Verifies ADR-001 and ADR-004 provenance contract:
    - audit_run_id is deterministic and content-addressed.
    - calc_version matches 2026.1.0 semantic version.
    - quarantine_status triggers for low-confidence or critical findings.
    - engagement_policy snapshot includes statutory_floor_enforced.
    """
    response = client.get("/api/v1/audit/concept_1_customs")
    assert response.status_code == 200
    data = response.json()

    assert "audit_run_id" in data
    assert data["audit_run_id"].startswith("RUN-2026-CONCEPT_1_CUSTOMS-")
    assert data["calc_version"] == "2026.1.0"
    assert data["quarantine_status"] == "QUARANTINED"
    assert "engagement_policy" in data
    assert data["engagement_policy"]["statutory_floor_enforced"] is True
    assert data["engagement_policy"]["commercial_freight_tolerance_usd"] == 25.0

def test_clean_fob_provenance_released():
    """
    Clean FOB invoice has zero critical discrepancies and zero low confidence items.
    quarantine_status must be RELEASED.
    """
    response = client.get("/api/v1/audit/concept_clean_fob")
    assert response.status_code == 200
    data = response.json()

    assert data["concept_id"] == "concept_clean_fob"
    assert data["quarantine_status"] == "RELEASED"
    assert data["audit_run_id"].startswith("RUN-2026-CONCEPT_CLEAN_FOB-")
