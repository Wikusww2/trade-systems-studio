"""Shared utility functions for currency, decimal math, and common operations."""

from decimal import ROUND_HALF_UP, Decimal
from typing import Any


def quantize_currency(amount: Decimal) -> Decimal:
    """Quantize financial amounts to 2 decimal places using ROUND_HALF_UP."""
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def safe_decimal(val: Any, default: str = "0.00") -> Decimal:
    """Safely convert value to Decimal, falling back to default on None, empty string, or error."""
    if val is None or val == "":
        return Decimal(default)
    try:
        return Decimal(str(val))
    except Exception:
        return Decimal(default)
