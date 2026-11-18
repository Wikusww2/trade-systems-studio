"use client";

import React from "react";

interface TabularAmountProps {
  value: number;
  currency?: string;
  showPlusSign?: boolean;
  decimals?: number;
  className?: string;
}

/**
 * Renders monetary figures on a rigid 3-column tabular grid:
 * [sign (1ch)] [currency symbol (1ch)] [tabular digits]
 * Prevents currency symbols ($, EUR, GBP) and +/- indicators from
 * displacing decimal points vertically across dense audit rows.
 */
export const TabularAmount: React.FC<TabularAmountProps> = ({
  value,
  currency = "$",
  showPlusSign = false,
  decimals = 2,
  className = "",
}) => {
  const isNegative = value < 0;
  const sign = isNegative ? "-" : showPlusSign && value > 0 ? "+" : "";
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

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
