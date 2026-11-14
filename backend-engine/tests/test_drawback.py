from decimal import Decimal
from app.services.drawback_audit import audit_duty_drawback

def test_duty_drawback_audit():
    test_data = {
        "dutiable_value": "240000.00",
        "duties_paid": "27600.00",
        "drawback_percentage": "0.99",
        "is_timely_5yr_window": True
    }

    metrics, discrepancies = audit_duty_drawback(test_data)
    
    # 99% of $27,600.00 = $27,324.00
    expected_refund = Decimal("27324.00")
    assert metrics.drawback_unclaimed_unlocked == expected_refund
    assert len(discrepancies) == 2
    
    recovery_disc = next(d for d in discrepancies if "99% Statutory Duty Drawback" in d.title)
    assert recovery_disc.exposure_amount == expected_refund
    assert recovery_disc.statutory_code == "19 U.S.C. § 1313(j)(1)"
    assert recovery_disc.severity == "opportunity"
