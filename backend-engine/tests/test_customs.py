from decimal import Decimal

from app.services.customs_audit import audit_customs_invoice, calculate_1592_penalties


def test_1592_penalties_calculation():
    # Lawful duty loss of $31,250.00
    loss = Decimal("31250.00")
    penalties = calculate_1592_penalties(loss)
    
    # Negligence 0.25x - 2.0x
    assert penalties["negligence"][0] == Decimal("7812.50")
    assert penalties["negligence"][1] == Decimal("62500.00")
    
    # Gross Negligence 2.5x - 4.0x
    assert penalties["gross_negligence"][0] == Decimal("78125.00")
    assert penalties["gross_negligence"][1] == Decimal("125000.00")

def test_customs_invoice_audit_errors():
    test_data = {
        "incoterms": "CIF LOS ANGELES",
        "insurance_charge": "0.00",
        "misclassified_value": "125000.00",
        "declared_duty_rate": "0.00",
        "lawful_duty_rate": "0.25",
        "items": [
            {
                "line_number": 1,
                "quantity": "500",
                "unit_price": "45.00",
                "stated_total": "25500.00" # Error: should be 22,500
            }
        ]
    }
    
    metrics, discrepancies = audit_customs_invoice(test_data)
    
    assert metrics.penalty_exposure_avoided == Decimal("125000.00")
    assert len(discrepancies) == 3
    
    # Check CIF missing insurance
    cif_disc = next(d for d in discrepancies if "CIF" in d.title)
    assert cif_disc.severity == "warning"
    assert cif_disc.confidence < 0.85 # Triggers dashed border in UI
    
    # Check Math error
    math_disc = next(d for d in discrepancies if "Arithmetic" in d.title)
    assert math_disc.exposure_amount == Decimal("3000.00")
    assert math_disc.severity == "critical"
    
    # Check HTS error
    hts_disc = next(d for d in discrepancies if "HTS Misclassification" in d.title)
    assert hts_disc.exposure_amount == Decimal("125000.00")
    assert hts_disc.statutory_code == "19 U.S.C. § 1592"


def test_customs_dynamic_hts_and_cif_excess_duty():
    """Verify custom line items dynamically populate HTS codes and CIF excess duty is computed (H1, M1)."""
    custom_payload = {
        "incoterms": "CIF LONG BEACH",
        "freight_charge": "5000.00",
        "insurance_charge": "0.00",
        "misclassified_value": "80000.00",
        "declared_duty_rate": "0.024",
        "lawful_duty_rate": "0.274",
        "declared_hts": "8501.31.8000",
        "lawful_hts": "8501.31.2000",
        "product_description": "Industrial Brushless DC Drone Motors",
        "items": [
            {
                "line_number": 1,
                "description": "Industrial Brushless DC Drone Motors",
                "declared_hts": "8501.31.8000",
                "lawful_hts": "8501.31.2000",
                "quantity": "200",
                "unit_price": "400.00",
                "stated_total": "80000.00",
            }
        ]
    }

    metrics, discrepancies = audit_customs_invoice(custom_payload)

    # CIF check should compute excess duty: $5,000 * 0.274 = $1,370.00
    cif_disc = next(d for d in discrepancies if "CIF" in d.title)
    assert cif_disc.metadata["overstated_dutiable_value"] == "5000.00"
    assert cif_disc.metadata["estimated_excess_duty"] == "1370.00"
    assert "estimated duty overpayment of $1,370.00" in cif_disc.executive_summary

    # HTS check should use custom description and codes, NOT hardcoded neural processors
    hts_disc = next(d for d in discrepancies if "HTS Misclassification" in d.title)
    assert "Industrial Brushless DC Drone Motors" in hts_disc.description
    assert "8501.31.8000" in hts_disc.description
    assert "8501.31.2000" in hts_disc.description
    assert hts_disc.metadata["product_description"] == "Industrial Brushless DC Drone Motors"
    assert hts_disc.metadata["declared_hts"] == "8501.31.8000"
    assert hts_disc.metadata["lawful_hts"] == "8501.31.2000"
