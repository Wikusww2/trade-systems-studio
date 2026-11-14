"use client";

import React, { useEffect, useState } from "react";

interface RollingNumberProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  decimals?: number;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  durationMs = 900,
  prefix = "$",
  decimals = 2,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    if (change === 0) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Apple-style cubic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + change * easeOut);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, durationMs]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
};
