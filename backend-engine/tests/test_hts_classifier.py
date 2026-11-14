"""Test suite for Autonomous HTS Classification Copilot & Landed Cost Engine."""

from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.services.hts_classifier import calculate_landed_cost, HTSClassifierEngine
from app.models.hts_models import ClassificationRequest
from main import app

client = TestClient(app)


def test_landed_cost_mathematical_precision():
    """Verify landed cost calculation using strict Python Decimal and statutory rules."""
    entered_val = Decimal("100000.00")
    duty_rate = Decimal("0.025")  # 2.5%
    freight = Decimal("2000.00")

    breakdown = calculate_landed_cost(
        entered_value=entered_val,
        duty_rate_ad_valorem=duty_rate,
        is_ocean_freight=True,
        freight_and_insurance=freight,
    )

    assert breakdown.customs_duty == Decimal("2500.00")
    # MPF: 100,000 * 0.003464 = 346.40 (within 31.67 and 614.35)
    assert breakdown.mpf_fee == Decimal("346.40")
    # HMF: 100,000 * 0.00125 = 125.00
    assert breakdown.hmf_fee == Decimal("125.00")
    assert breakdown.total_customs_cost == Decimal("2971.40")
    assert breakdown.total_landed_cost == Decimal("104971.40")


def test_mpf_statutory_minimum_cap():
    """Verify MPF is floored at statutory minimum ($31.67) for low value cargo."""
    breakdown = calculate_landed_cost(
        entered_value=Decimal("1000.00"),
        duty_rate_ad_valorem=Decimal("0.05"),
        is_ocean_freight=False,
    )
    # Raw MPF is 3.46, must be clamped to statutory min 31.67
    assert breakdown.mpf_fee == Decimal("31.67")
    assert breakdown.hmf_fee == Decimal("0.00")  # Air freight has no HMF


def test_mpf_statutory_maximum_cap():
    """Verify MPF is capped at statutory maximum ($614.35) for high value cargo."""
    breakdown = calculate_landed_cost(
        entered_value=Decimal("500000.00"),
        duty_rate_ad_valorem=Decimal("0.05"),
        is_ocean_freight=True,
    )
    # Raw MPF is 1732.00, must be clamped to statutory max 614.35
    assert breakdown.mpf_fee == Decimal("614.35")


def test_wco_gri_drone_motor_classification():
    """Verify GRI 1-6 hierarchical decision tree traversal for drone motor with ESC."""
    engine = HTSClassifierEngine()
    req = ClassificationRequest(
        product_title="Industrial Brushless DC Drone Motor with Integrated Electronic Speed Controller",
        product_description="High-torque 480W brushless DC motor for agricultural UAVs with integrated ESC module.",
        entered_value=Decimal("45000.00"),
        is_ocean_freight=True,
    )
    result = engine.classify(req)

    assert result.classified_hts_code == "8501.31.8000"
    assert result.confidence >= 0.85
    assert not result.requires_human_review
    assert len(result.gri_path) >= 3
    assert result.gri_path[0].step_rule == "GRI 1"
    assert "8501" in result.gri_path[1].heading_or_subheading
    assert any("Section XVI" in note for note in result.chapter_notes_cited)


def test_low_confidence_triggers_human_review():
    """Verify confidence < 0.85 triggers dashed amber review requirement."""
    engine = HTSClassifierEngine()
    req = ClassificationRequest(
        product_title="Multi-Sensor Fitness Tracking Smartband with Heart Rate Sensor & BLE",
        product_description="Wearable smartband with PPG heart rate, pedometer, and Bluetooth sync.",
        entered_value=Decimal("12000.00"),
    )
    result = engine.classify(req)

    assert result.classified_hts_code == "8517.62.0050"
    assert result.confidence < 0.85
    assert result.requires_human_review is True


def test_hts_api_endpoints():
    """Verify HTTP API endpoints for HTS classification and presets."""
    response = client.get("/api/v1/hts/preset/server_accelerator?entered_value=50000")
    assert response.status_code == 200
    data = response.json()
    assert data["classified_hts_code"] == "8542.31.0001"
    assert data["landed_cost"]["entered_value"] == "50000.00"
    assert data["landed_cost"]["customs_duty"] == "0.00"  # ITA free duty
