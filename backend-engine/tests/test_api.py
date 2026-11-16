from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_concept_1_customs_audit():
    response = client.get("/api/v1/audit/concept_1_customs")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_1_customs"
    assert data["metrics"]["penalty_exposure_avoided"] == 125000.0
    assert len(data["discrepancies"]) >= 3
    # Verify uncertainty bounding box
    cif = next(d for d in data["discrepancies"] if "CIF" in d["title"])
    assert cif["confidence"] < 0.85

def test_concept_2_freight_audit():
    response = client.get("/api/v1/audit/concept_2_freight")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_2_freight"
    assert data["metrics"]["carrier_overbilling_caught"] == 1547.5
    assert len(data["discrepancies"]) == 3

def test_concept_3_drawback_audit():
    response = client.get("/api/v1/audit/concept_3_drawback")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_3_drawback"
    assert data["metrics"]["drawback_unclaimed_unlocked"] == 27324.0
    assert len(data["discrepancies"]) >= 2

def test_aggregate_metrics():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["penalty_exposure_avoided"] == 125000.0
    assert data["carrier_overbilling_caught"] == 1547.5
    assert data["drawback_unclaimed_unlocked"] == 27324.0

def test_document_download():
    response = client.get("/api/v1/documents/nightmare_01_customs_ci.pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000

def test_lead_capture():
    payload = {
        "email": "prospect@tradetech.com",
        "company_name": "Apex Global Logistics",
        "phone": "+1-555-019-2834",
        "monthly_import_volume": "100+ TEUs"
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_telemetry():
    payload = {
        "event_type": "discrepancy_hover",
        "concept_id": "concept_1_customs",
        "discrepancy_id": "disc-c1-01",
        "metadata": {"zoom": 1.0}
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_sanctions_screen_api():
    payload = {
        "shipper": "Global Micro Electronics Ltd, Shenzhen",
        "buyer": "Pacific Apex Corp",
        "threshold": 85.0
    }
    response = client.post("/api/v1/sanctions/screen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_violations"] is True
    assert data["shipper"]["matched"] is True
    assert data["shipper"]["entity_id"] == "bis-el-cn-0941"

def test_layout_extraction_api():
    response = client.post("/api/v1/layout/extract?filename=nightmare_01_customs_ci.pdf")
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "nightmare_01_customs_ci.pdf"
    assert data["box_count"] > 0
    assert data["coordinate_space"] == "[0, 1000)"
