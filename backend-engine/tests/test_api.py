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
    assert data["metrics"]["penalty_exposure_avoided"] == "125000.00"
    assert len(data["discrepancies"]) >= 3
    # Verify uncertainty bounding box
    cif = next(d for d in data["discrepancies"] if "CIF" in d["title"])
    assert cif["confidence"] < 0.85

def test_concept_2_freight_audit():
    response = client.get("/api/v1/audit/concept_2_freight")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_2_freight"
    assert data["metrics"]["carrier_overbilling_caught"] == "1547.50"
    assert len(data["discrepancies"]) == 3

def test_concept_3_drawback_audit():
    response = client.get("/api/v1/audit/concept_3_drawback")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_3_drawback"
    assert data["metrics"]["drawback_unclaimed_unlocked"] == "27324.00"
    assert len(data["discrepancies"]) >= 2

def test_aggregate_metrics():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["penalty_exposure_avoided"] == "125000.00"
    assert data["carrier_overbilling_caught"] == "1547.50"
    assert data["drawback_unclaimed_unlocked"] == "27324.00"

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

def test_concept_4_sanctions_audit_endpoint():
    """Verify GET /api/v1/audit/concept_4_sanctions executes dynamic screening via HTTP API."""
    response = client.get("/api/v1/audit/concept_4_sanctions")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "concept_4_sanctions"
    assert data["metrics"]["penalty_exposure_avoided"] == "350000.00"
    assert len(data["discrepancies"]) == 1
    assert "55%" in data["discrepancies"][0]["title"]

def test_cors_preflight_trusted_origin():
    """Verify trusted origin receives CORS allow headers with credentials (H4)."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_preflight_untrusted_origin_rejected():
    """Verify untrusted origin is NOT granted CORS allow origin headers (H4)."""
    headers = {
        "Origin": "http://evil-unauthorized-domain.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/api/v1/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") != "http://evil-unauthorized-domain.com"
    assert response.headers.get("access-control-allow-origin") != "*"

def test_document_download_not_found():
    """Verify 404 response for missing documents without triggering disk generation (M8)."""
    response = client.get("/api/v1/documents/non_existent_fixture_file.pdf")
    assert response.status_code == 404
    assert response.json()["detail"] == "Document fixture not found"

def test_lead_capture_validation_invalid_email():
    """Verify lead capture rejects invalid email with 422 (H5)."""
    payload = {
        "email": "not-a-valid-email",
        "company_name": "Valid Company Inc."
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 422

def test_lead_capture_validation_missing_required_fields():
    """Verify lead capture rejects payload missing required company_name with 422 (H5)."""
    payload = {
        "email": "valid@company.com"
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 422

def test_lead_capture_validation_forbidden_extra_fields():
    """Verify lead capture rejects unmodeled extra fields with 422 (H5)."""
    payload = {
        "email": "valid@company.com",
        "company_name": "Valid Company Inc.",
        "arbitrary_injection": "malicious"
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 422

def test_lead_capture_payload_too_large():
    """Verify lead capture rejects payloads larger than 16 KB with 413 (H5)."""
    payload = {
        "email": "valid@company.com",
        "company_name": "x" * 20000
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 413

def test_lead_capture_rate_limiting():
    """Verify in-memory sliding window rate limiter triggers 429 on abuse (H5)."""
    from app.api.endpoints import leads_rate_limiter
    leads_rate_limiter.reset()
    payload = {
        "email": "rate_limit_test@example.com",
        "company_name": "Test Company Corp"
    }
    # Send up to the limit
    for _ in range(60):
        res = client.post("/api/v1/leads", json=payload)
        assert res.status_code == 200

    # 61st request must trigger 429
    blocked_res = client.post("/api/v1/leads", json=payload)
    assert blocked_res.status_code == 429
    assert "Rate limit exceeded" in blocked_res.json()["detail"]
    leads_rate_limiter.reset()

def test_telemetry_validation_forbidden_extra_fields():
    """Verify telemetry rejects unmodeled extra fields with 422 (H5)."""
    payload = {
        "event_type": "discrepancy_hover",
        "unauthorized_field": "data"
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 422

def test_telemetry_payload_too_large():
    """Verify telemetry rejects payloads larger than 32 KB with 413 (H5)."""
    payload = {
        "event_type": "discrepancy_hover",
        "metadata": {"bloat": "x" * 40000}
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 413

def test_telemetry_rate_limiting():
    """Verify in-memory sliding window rate limiter triggers 429 on abuse (H5)."""
    from app.api.endpoints import telemetry_rate_limiter
    telemetry_rate_limiter.reset()
    payload = {
        "event_type": "tab_switch",
        "concept_id": "concept_1_customs"
    }
    for _ in range(300):
        res = client.post("/api/v1/telemetry", json=payload)
        assert res.status_code == 200

    blocked_res = client.post("/api/v1/telemetry", json=payload)
    assert blocked_res.status_code == 429
    assert "Rate limit exceeded" in blocked_res.json()["detail"]
    telemetry_rate_limiter.reset()

def test_scenarios_monetary_fields_are_decimal_strings():
    """Verify /api/v1/scenarios returns monetary exposures as Decimal strings (H8)."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3
    for s in scenarios:
        assert isinstance(s["default_exposure_usd"], str), (
            f"default_exposure_usd should be Decimal string, got {type(s['default_exposure_usd'])}"
        )
        # Verify valid decimal representation
        from decimal import Decimal
        d = Decimal(s["default_exposure_usd"])
        assert d > Decimal("0.00")

def test_no_circular_asgi_proxy():
    """Verify _ASGIAppProxy is eliminated from endpoints module (L2)."""
    import app.api.endpoints as ep
    assert not hasattr(ep, "_ASGIAppProxy"), "Circular-import _ASGIAppProxy still exists in endpoints (L2)"
