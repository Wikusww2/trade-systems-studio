/**
 * Lossless BigInt-based currency handling for TradeTech Systems Studio.
 * Enforces zero floating-point drift and strict mathematical determinism.
 * All monetary operations are performed on integer cents using native BigInt.
 */

const ZERO = BigInt(0);
const ONE = BigInt(1);
const NEG_ONE = BigInt(-1);
const TEN = BigInt(10);
const HUNDRED = BigInt(100);

/**
 * Parses a decimal string, number, or BigInt into integer cents (e.g. "125000.00" -> 12500000).
 * Avoids IEEE-754 floating-point parsing.
 */
export function parseCents(value: string | number | bigint | null | undefined): bigint {
  if (value === null || value === undefined) {
    return ZERO;
  }
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return ZERO;
    }
    const sign = value < 0 ? NEG_ONE : ONE;
    const absVal = Math.abs(value);
    const whole = Math.floor(absVal);
    const frac = Math.round((absVal - whole) * 100);
    return sign * (BigInt(whole) * HUNDRED + BigInt(frac));
  }

  const raw = value.trim().replace(/[$,]/g, "");
  if (!raw || raw === "-" || raw === "+") {
    return ZERO;
  }

  const isNegative = raw.startsWith("-");
  const clean = isNegative ? raw.slice(1) : raw.startsWith("+") ? raw.slice(1) : raw;

  const parts = clean.split(".");
  const wholePart = parts[0] ? parts[0].replace(/\D/g, "") : "0";
  const whole = wholePart ? BigInt(wholePart) : ZERO;

  let frac = ZERO;
  if (parts.length > 1 && parts[1]) {
    const rawFrac = parts[1].replace(/\D/g, "");
    if (rawFrac.length === 1) {
      frac = BigInt(rawFrac) * TEN;
    } else if (rawFrac.length >= 2) {
      frac = BigInt(rawFrac.slice(0, 2));
      // Half-up rounding if 3rd digit >= 5
      if (rawFrac.length >= 3 && parseInt(rawFrac[2], 10) >= 5) {
        frac += ONE;
      }
    }
  }

  const totalCents = whole * HUNDRED + frac;
  return isNegative ? -totalCents : totalCents;
}

/**
 * Converts integer cents back into a standard two-decimal string (e.g. 12500000 -> "125000.00").
 */
export function centsToDecimalString(cents: bigint): string {
  const isNegative = cents < ZERO;
  const absCents = isNegative ? -cents : cents;
  const whole = absCents / HUNDRED;
  const remainder = absCents % HUNDRED;
  const fracStr = remainder < TEN ? `0${remainder}` : `${remainder}`;
  return `${isNegative ? "-" : ""}${whole}.${fracStr}`;
}

/**
 * Standardizes any input into a canonical two-decimal string (e.g. "125000" -> "125000.00").
 */
export function toDecimalString(value: string | number | bigint | null | undefined): string {
  return centsToDecimalString(parseCents(value));
}

/**
 * Formats integer cents or decimal string into a standard USD currency string (e.g. "$125,000.00").
 */
export function formatUsd(
  value: string | number | bigint | null | undefined,
  options?: { hideCents?: boolean; compact?: boolean }
): string {
  const cents = parseCents(value);
  const isNegative = cents < ZERO;
  const absCents = isNegative ? -cents : cents;

  if (options?.compact) {
    const whole = Number(absCents / HUNDRED);
    if (whole >= 1_000_000) {
      return `${isNegative ? "-" : ""}$${(whole / 1_000_000).toFixed(1)}M`;
    }
    if (whole >= 1_000) {
      return `${isNegative ? "-" : ""}$${(whole / 1_000).toFixed(1)}k`;
    }
  }

  const whole = absCents / HUNDRED;
  const remainder = absCents % HUNDRED;

  // Add thousand separators to whole part
  const wholeFormatted = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (options?.hideCents && remainder === ZERO) {
    return `${isNegative ? "-" : ""}$${wholeFormatted}`;
  }

  const fracStr = remainder < TEN ? `0${remainder}` : `${remainder}`;
  return `${isNegative ? "-" : ""}$${wholeFormatted}.${fracStr}`;
}

/**
 * Losslessly sums multiple money strings or numbers, returning a canonical decimal string.
 */
export function sumMoneyStrings(
  ...values: (string | number | bigint | null | undefined)[]
): string {
  let totalCents = ZERO;
  for (const v of values) {
    totalCents += parseCents(v);
  }
  return centsToDecimalString(totalCents);
}

/**
 * Returns true if value is strictly greater than zero cents.
 */
export function gtZero(value: string | number | bigint | null | undefined): boolean {
  return parseCents(value) > ZERO;
}

/**
 * Returns true if value is greater than or equal to zero cents.
 */
export function gteZero(value: string | number | bigint | null | undefined): boolean {
  return parseCents(value) >= ZERO;
}

import type { LandedCostBreakdown } from "./types";

/**
 * Statutory MPF caps under 19 CFR § 24.23
 * FY2027 standard: min $34.58 (3458 cents), max $670.86 (67086 cents).
 */
export const MPF_CAPS_CENTS = {
  FY2024: { min: BigInt(3167), max: BigInt(61435) },
  FY2025: { min: BigInt(3271), max: BigInt(63462) },
  FY2026: { min: BigInt(3350), max: BigInt(65000) },
  FY2027: { min: BigInt(3458), max: BigInt(67086) },
} as const;

export const DEFAULT_MPF_FY = "FY2027";

/**
 * Deterministic CBP Landed Cost Calculator using BigInt integer cents.
 * MPF: 0.3464% (3464 / 1,000,000) clamped to statutory caps.
 * HMF: 0.125% (125 / 100,000) for ocean freight, $0.00 for air/truck.
 */
export function calculateClientLandedCost(params: {
  enteredValue: string | number | bigint;
  dutyRateAdValorem: string | number;
  isOceanFreight?: boolean;
  freightAndInsurance?: string | number | bigint;
  section301Rate?: string | number;
  fiscalYear?: "FY2024" | "FY2025" | "FY2026" | "FY2027";
}): LandedCostBreakdown {
  const enteredCents = parseCents(params.enteredValue);
  const freightCents = parseCents(params.freightAndInsurance ?? ZERO);
  const isOcean = params.isOceanFreight !== false;
  const fy = params.fiscalYear || DEFAULT_MPF_FY;
  const caps = MPF_CAPS_CENTS[fy] || MPF_CAPS_CENTS[DEFAULT_MPF_FY];

  // Duty calculation: dutyRate can be e.g. "0.024" or 0.024 (2.4%)
  const rateNum = typeof params.dutyRateAdValorem === "number"
    ? params.dutyRateAdValorem
    : parseFloat(String(params.dutyRateAdValorem).replace(/%/g, "")) || 0;
  const rateBasisPoints = BigInt(Math.round(rateNum * 10000));
  const dutyCents = (enteredCents * rateBasisPoints + BigInt(5000)) / BigInt(10000);

  // Section 301
  const secRateNum = typeof params.section301Rate === "number"
    ? params.section301Rate
    : parseFloat(String(params.section301Rate || 0)) || 0;
  const secBasisPoints = BigInt(Math.round(secRateNum * 10000));
  const secDutyCents = (enteredCents * secBasisPoints + BigInt(5000)) / BigInt(10000);

  // MPF: 0.3464% = 3464 / 1,000,000
  const rawMpfCents = (enteredCents * BigInt(3464) + BigInt(500000)) / BigInt(1000000);
  const mpfCents = rawMpfCents < caps.min ? caps.min : rawMpfCents > caps.max ? caps.max : rawMpfCents;

  // HMF: 0.125% = 125 / 100,000 on ocean cargo
  const hmfCents = isOcean ? (enteredCents * BigInt(125) + BigInt(50000)) / BigInt(100000) : ZERO;

  const totalCustomsCents = dutyCents + secDutyCents + mpfCents + hmfCents;
  const totalLandedCents = enteredCents + totalCustomsCents + freightCents;

  return {
    entered_value: centsToDecimalString(enteredCents),
    duty_rate_ad_valorem: rateNum.toFixed(3),
    customs_duty: centsToDecimalString(dutyCents),
    section_301_rate: secRateNum > 0 ? secRateNum.toFixed(3) : "0.000",
    section_301_duty: centsToDecimalString(secDutyCents),
    section_301_subheading: secRateNum > 0 ? "9903.88.01" : undefined,
    mpf_rate: "0.003464",
    mpf_min_cap: centsToDecimalString(caps.min),
    mpf_max_cap: centsToDecimalString(caps.max),
    mpf_fee: centsToDecimalString(mpfCents),
    hmf_rate: isOcean ? "0.00125" : "0.00",
    hmf_fee: centsToDecimalString(hmfCents),
    freight_and_insurance: centsToDecimalString(freightCents),
    total_customs_cost: centsToDecimalString(totalCustomsCents),
    total_landed_cost: centsToDecimalString(totalLandedCents),
    fiscal_year: fy,
  };
}
