"use client";

import React from "react";
import { RollingNumber } from "./RollingNumber";

interface KillShotMetricsBarProps {
  exposureAvoided: string | number;
  carrierOverbilling: string | number;
  drawbackUnlocked: string | number;
}

export const KillShotMetricsBar: React.FC<KillShotMetricsBarProps> = ({
  exposureAvoided,
  carrierOverbilling,
  drawbackUnlocked,
}) => {
  return (
    <div
      aria-live="polite"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono"
    >
      <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
        <div className="type-caption-mono uppercase text-ink-muted">
          19 U.S.C. § 1592 Exposure Avoided
        </div>
        <div className="type-display-md sm:type-display-lg font-mono text-ink-crimson tabular-nums mt-0.5">
          <RollingNumber value={exposureAvoided} />
        </div>
        <div className="type-caption-mono text-ink-muted mt-0.5">
          Statutory safe-harbor mitigation
        </div>
      </div>

      <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
        <div className="type-caption-mono uppercase text-ink-muted">
          Pre-Payment Freight Overbilling Intercepted
        </div>
        <div className="type-display-md sm:type-display-lg font-mono text-ink-crimson tabular-nums mt-0.5">
          <RollingNumber value={carrierOverbilling} />
        </div>
        <div className="type-caption-mono text-ink-muted mt-0.5">
          Withheld prior to cash disbursement
        </div>
      </div>

      <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
        <div className="type-caption-mono uppercase text-ink-muted">
          99% Duty Drawback Cash Unlocked
        </div>
        <div className="type-display-md sm:type-display-lg font-mono text-ink-emerald tabular-nums mt-0.5">
          <RollingNumber value={drawbackUnlocked} />
        </div>
        <div className="type-caption-mono text-ink-muted mt-0.5">
          19 U.S.C. § 1313 direct cash refund
        </div>
      </div>
    </div>
  );
};
