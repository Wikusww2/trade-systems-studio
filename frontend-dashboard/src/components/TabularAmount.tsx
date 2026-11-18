"use client";

import React from "react";
import { parseCents } from "@/lib/money";

interface TabularAmountProps {
  value: string | number | bigint;
  currency?: string;
  showPlusSign?: boolean;
  decimals?: number;
  className?: string;
}

const ZERO = BigInt(0);
const TEN = BigInt(10);
const HUNDRED = BigInt(100);

/**
 * Renders monetary figures on a rigid 3-column tabular grid:
 * [sign (1ch)] [currency symbol (1ch)] [tabular digits]
 * Prevents currency symbols ($, EUR, GBP) and +/- indicators from
 * displacing decimal points vertically across dense audit rows.
 * Implemented with BigInt scaled cents for zero float drift.
 */
export const TabularAmount: React.FC<TabularAmountProps> = ({
  value,
  currency = "$",
  showPlusSign = false,
  decimals = 2,
  className = "",
}) => {
  const cents = parseCents(value);
  const isNegative = cents < ZERO;
  const absCents = isNegative ? -cents : cents;
  const sign = isNegative ? "-" : showPlusSign && cents > ZERO ? "+" : "";

  const whole = absCents / HUNDRED;
  const frac = absCents % HUNDRED;
  const wholeFormatted = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fracFormatted = frac < TEN ? `0${frac}` : `${frac}`;
  const formatted = decimals === 0 ? wholeFormatted : `${wholeFormatted}.${fracFormatted}`;

  return (
    <span className={`tabular-currency ${className}`.trim()}>
      <span className="text-right select-none" aria-hidden={!sign}>
        {sign || "\u00A0"}
      </span>
      <span className="text-right select-none">{currency}</span>
      <span className="tabular-nums text-right">{formatted}</span>
    </span>
  );
};
