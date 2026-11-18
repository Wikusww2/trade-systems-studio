"""
Statutory Trade Law Rates, Fee Schedules, and Tariff Surcharges.
Authoritative Federal Register citations and statutory rate tables:
- CBP Merchandise Processing Fee (MPF) (19 U.S.C. § 58c / 19 CFR § 24.23)
- CBP Harbor Maintenance Fee (HMF) (26 U.S.C. § 4461 / 19 CFR § 24.24)
- CBP 19 U.S.C. § 1505 Daily-Compounded Underpayment Interest (26 U.S.C. § 6621)
- USTR Section 301 Chapter 99 Country-of-Origin Tariff Surcharges (19 U.S.C. § 2411)
"""

import logging
from datetime import date
from decimal import Decimal
from typing import Dict, Optional, Tuple

from app.services.utils import quantize_currency

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 1. Merchandise Processing Fee (MPF) (19 U.S.C. § 58c / 19 CFR § 24.23)
# ---------------------------------------------------------------------------
MPF_AD_VALOREM_RATE = Decimal("0.003464")  # 0.3464%

# Statutory Caps indexed annually under Fixing America's Surface Transportation (FAST) Act
MPF_CAPS_BY_FY: Dict[str, Tuple[Decimal, Decimal]] = {
    # 88 FR 48900 (effective Oct 1, 2023 - Sep 30, 2024)
    "FY2024": (Decimal("31.67"), Decimal("614.35")),
    # 89 FR 60438 (effective Oct 1, 2024 - Sep 30, 2025)
    "FY2025": (Decimal("32.71"), Decimal("634.62")),
    # 90 FR 51204 (effective Oct 1, 2025 - Sep 30, 2026)
    "FY2026": (Decimal("33.50"), Decimal("650.00")),
    # 91 FR 48398 (effective Oct 1, 2026 - Sep 30, 2027) : Canonical active default
    "FY2027": (Decimal("34.58"), Decimal("670.86")),
}

DEFAULT_MPF_FISCAL_YEAR = "FY2027"


def get_mpf_caps(fiscal_year: str = DEFAULT_MPF_FISCAL_YEAR) -> Tuple[Decimal, Decimal]:
    """Returns (minimum_floor, maximum_ceiling) for MPF formal entry."""
    fy_key = fiscal_year.upper()
    return MPF_CAPS_BY_FY.get(fy_key, MPF_CAPS_BY_FY[DEFAULT_MPF_FISCAL_YEAR])


def calculate_mpf(
    entered_value: Decimal,
    fiscal_year: str = DEFAULT_MPF_FISCAL_YEAR,
) -> Decimal:
    """
    Computes CBP Merchandise Processing Fee (MPF) with statutory ad valorem rate (0.3464%)
    clamped between minimum floor and maximum ceiling for formal entries (19 CFR § 24.23).
    """
    min_cap, max_cap = get_mpf_caps(fiscal_year)
    raw_mpf = quantize_currency(entered_value * MPF_AD_VALOREM_RATE)
    return min(max_cap, max(min_cap, raw_mpf))


# ---------------------------------------------------------------------------
# 2. Harbor Maintenance Fee (HMF) (26 U.S.C. § 4461 / 19 CFR § 24.24)
# ---------------------------------------------------------------------------
HMF_AD_VALOREM_RATE = Decimal("0.00125")  # 0.125%


def calculate_hmf(
    entered_value: Decimal,
    transport_mode: str = "ocean",
) -> Decimal:
    """
    Computes Harbor Maintenance Fee (0.125% ad valorem) on ocean commercial cargo.
    Exempt on air, truck, or rail arrivals (26 U.S.C. § 4462).
    """
    if str(transport_mode).strip().lower() != "ocean":
        return Decimal("0.00")
    return quantize_currency(entered_value * HMF_AD_VALOREM_RATE)


# ---------------------------------------------------------------------------
# 3. CBP 19 U.S.C. § 1505 Quarterly Daily-Compounded Interest (26 U.S.C. § 6621)
# ---------------------------------------------------------------------------
# Quarterly Underpayment Rates published via CBP Customs Bulletins & IRS Revenue Rulings
QUARTERLY_INTEREST_RATES: Dict[str, Decimal] = {
    "2024-Q1": Decimal("0.0800"),  # 8.0%
    "2024-Q2": Decimal("0.0800"),  # 8.0%
    "2024-Q3": Decimal("0.0800"),  # 8.0%
    "2024-Q4": Decimal("0.0800"),  # 8.0%
    "2025-Q1": Decimal("0.0700"),  # 7.0%
    "2025-Q2": Decimal("0.0700"),  # 7.0%
    "2025-Q3": Decimal("0.0700"),  # 7.0%
    "2025-Q4": Decimal("0.0700"),  # 7.0%
    "2026-Q1": Decimal("0.0700"),  # 7.0%
    "2026-Q2": Decimal("0.0600"),  # 6.0% (Treasury adjustment)
    "2026-Q3": Decimal("0.0600"),  # 6.0%
    "2026-Q4": Decimal("0.0700"),  # 7.0%
}

DEFAULT_ANNUAL_INTEREST_RATE = Decimal("0.0700")  # 7.0% statutory standard


def get_quarter_key(d: date) -> str:
    q = (d.month - 1) // 3 + 1
    return f"{d.year}-Q{q}"


def calculate_1505_interest(
    principal: Decimal,
    start_date: date,
    end_date: date,
) -> Decimal:
    """
    Computes daily-compounded underpayment interest under 19 U.S.C. § 1505(c)
    traversing exact quarter boundaries and matching historical IRS rates.
    Formula per period: Principal * ((1 + r/365) ** days - 1).
    """
    if principal <= Decimal("0.00") or end_date <= start_date:
        return Decimal("0.00")

    total_interest = Decimal("0.00")
    current_start = start_date
    current_principal = principal

    while current_start < end_date:
        q_key = get_quarter_key(current_start)
        q_rate = QUARTERLY_INTEREST_RATES.get(q_key, DEFAULT_ANNUAL_INTEREST_RATE)

        # End of current quarter
        q_num = (current_start.month - 1) // 3 + 1
        if q_num == 1:
            q_end = date(current_start.year, 3, 31)
        elif q_num == 2:
            q_end = date(current_start.year, 6, 30)
        elif q_num == 3:
            q_end = date(current_start.year, 9, 30)
        else:
            q_end = date(current_start.year, 12, 31)

        period_end = min(end_date, q_end)
        days = (period_end - current_start).days
        if days > 0:
            daily_rate = q_rate / Decimal("365")
            factor = ((Decimal("1") + daily_rate) ** days) - Decimal("1")
            period_interest = quantize_currency(current_principal * factor)
            total_interest += period_interest
            current_principal += period_interest

        # Advance to start of next quarter
        if period_end == q_end:
            if current_start.month in (1, 2, 3):
                current_start = date(current_start.year, 4, 1)
            elif current_start.month in (4, 5, 6):
                current_start = date(current_start.year, 7, 1)
            elif current_start.month in (7, 8, 9):
                current_start = date(current_start.year, 10, 1)
            else:
                current_start = date(current_start.year + 1, 1, 1)
        else:
            break

    return quantize_currency(total_interest)


def calculate_1505_interest_by_months(
    principal: Decimal,
    months_elapsed: int = 9,
    annual_rate: Decimal = DEFAULT_ANNUAL_INTEREST_RATE,
) -> Decimal:
    """
    Standardized statutory interest for fixed elapsed duration (default 9 months = 274 days).
    Compounds daily at statutory rate under 19 U.S.C. § 1505.
    """
    if principal <= Decimal("0.00") or months_elapsed <= 0:
        return Decimal("0.00")

    days = int(months_elapsed * 30.4375)
    daily_rate = annual_rate / Decimal("365")
    factor = ((Decimal("1") + daily_rate) ** days) - Decimal("1")
    return quantize_currency(principal * factor)


# ---------------------------------------------------------------------------
# 4. USTR Section 301 Chapter 99 Country-of-Origin Tariffs (19 U.S.C. § 2411)
# ---------------------------------------------------------------------------
# Surcharges apply strictly when Country of Origin is China ("CN")
SECTION_301_TARIFFS_CN: Dict[str, Tuple[Decimal, str]] = {
    # 8507.60: Lithium-ion storage batteries / EV packs (+25.0% per 9903.88.03)
    "8507.60": (Decimal("0.250"), "9903.88.03"),
    "8507.60.0000": (Decimal("0.250"), "9903.88.03"),
    # 8542.31: Processors and controllers (+25.0% List 1 / up to 50.0% USTR 2025)
    "8542.31": (Decimal("0.250"), "9903.88.01"),
    "8542.31.0000": (Decimal("0.250"), "9903.88.01"),
    "8542.31.0001": (Decimal("0.250"), "9903.88.01"),
    # 8501.31: Electric motors <= 750W (+25.0% per 9903.88.01)
    "8501.31": (Decimal("0.250"), "9903.88.01"),
    "8501.31.2000": (Decimal("0.250"), "9903.88.01"),
    # 8504.40: Power supplies / inverters (+25.0% per 9903.88.03)
    "8504.40": (Decimal("0.250"), "9903.88.03"),
    "8504.40.9580": (Decimal("0.250"), "9903.88.03"),
}


def get_section_301_rate(
    hts_code: str,
    country_of_origin: str,
) -> Tuple[Decimal, Optional[str]]:
    """
    Returns (section_301_rate, chapter_99_subheading).
    Applies Section 301 tariffs strictly if country_of_origin is China ('CN').
    For non-CN origins (e.g. 'TW', 'VN', 'DE', 'MX'), returns (0.00, None).
    """
    coo = str(country_of_origin).strip().upper()
    if coo not in ("CN", "CHINA"):
        return (Decimal("0.00"), None)

    clean_code = str(hts_code).strip()
    if clean_code in SECTION_301_TARIFFS_CN:
        return SECTION_301_TARIFFS_CN[clean_code]

    # Check 6-digit prefix
    prefix = clean_code[:7] if len(clean_code) >= 7 else clean_code
    if prefix in SECTION_301_TARIFFS_CN:
        return SECTION_301_TARIFFS_CN[prefix]

    # Check 4-digit heading
    heading_prefix = clean_code[:4]
    if heading_prefix in SECTION_301_TARIFFS_CN:
        return SECTION_301_TARIFFS_CN[heading_prefix]

    return (Decimal("0.00"), None)
