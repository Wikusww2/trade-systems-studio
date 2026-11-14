"use client";

import React, { useState } from "react";
import { AlertOctagon, Scale, ShieldAlert, ArrowRight, Check } from "lucide-react";
import { sound } from "@/lib/audio";

interface PenaltyExposureLadderProps {
  dutyLossUsd?: number;
  domesticValueUsd?: number;
}

export const PenaltyExposureLadder: React.FC<PenaltyExposureLadderProps> = ({
  dutyLossUsd = 6000,
  domesticValueUsd = 125000,
}) => {
  const [culpability, setCulpability] = useState<"negligence" | "gross_negligence" | "fraud">("fraud");

  const tiers = {
    negligence: {
      label: "Negligence",
      multiplier: "0.5x – 2.0x Duty Loss",
      statute: "19 U.S.C. § 1592(c)(3)",
      penaltyMin: dutyLossUsd * 0.5,
      penaltyMax: dutyLossUsd * 2.0,
      description: "Failure to exercise reasonable care without intent to deceive.",
      defense: "Prior Disclosure under 19 CFR § 162.74 reduces penalty to interest only.",
      accent: "text-amber-500 border-amber-500/50 bg-amber-500/10",
      barColor: "bg-amber-500",
      gaugePct: "30%",
    },
    gross_negligence: {
      label: "Gross Negligence",
      multiplier: "2.5x – 4.0x Duty Loss",
      statute: "19 U.S.C. § 1592(c)(2)",
      penaltyMin: dutyLossUsd * 2.5,
      penaltyMax: dutyLossUsd * 4.0,
      description: "Reckless disregard or willful indifference to customs valuation statutes.",
      defense: "Establish documented internal compliance controls and immediate corrective filing.",
      accent: "text-orange-500 border-orange-500/50 bg-orange-500/10",
      barColor: "bg-orange-500",
      gaugePct: "65%",
    },
    fraud: {
      label: "Civil Fraud",
      multiplier: "Up to 100% Domestic Value",
      statute: "19 U.S.C. § 1592(c)(1)",
      penaltyMin: domesticValueUsd,
      penaltyMax: domesticValueUsd,
      description: "Knowing material misstatement or willful omission on CBP Entry Summary 7501.",
      defense: "Immediate statutory safe-harbor tender of differential duties before CBP investigation notice.",
      accent: "text-rose-500 border-rose-500/50 bg-rose-500/10",
      barColor: "bg-rose-500",
      gaugePct: "100%",
    },
  };

  const active = tiers[culpability];

  const handleSelect = (tier: "negligence" | "gross_negligence" | "fraud") => {
    sound.playTick();
    setCulpability(tier);
  };

  return (
    <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-sm font-mono text-white">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            19 U.S.C. § 1592 Statutory Risk Ladder
          </span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase">Interactive Exposure Gauge</span>
      </div>

      {/* Tier Selector Buttons */}
      <div className="grid grid-cols-3 gap-1.5 mb-4 p-1 bg-slate-950 rounded-xs border border-slate-800">
        {(["negligence", "gross_negligence", "fraud"] as const).map((tierKey) => {
          const item = tiers[tierKey];
          const isSelected = culpability === tierKey;
          return (
            <button
              key={tierKey}
              onClick={() => handleSelect(tierKey)}
              className={`py-2 px-1 text-center rounded-xs text-[11px] font-bold uppercase tracking-wider transition-all ${
                isSelected
                  ? `${item.barColor} text-white shadow-sm`
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Gauge Bar */}
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-800">
        <div
          className={`h-full transition-all duration-300 ease-out ${active.barColor}`}
          style={{ width: active.gaugePct }}
        />
      </div>

      {/* Calculated Maximum Exposure Card */}
      <div className={`p-3 rounded-xs border ${active.accent} mb-3`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {active.statute} Multiplier
          </span>
          <span className="text-xs font-bold text-slate-200">{active.multiplier}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-400">
            ${active.penaltyMax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400">Statutory Ceiling</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
          {active.description}
        </p>
      </div>

      {/* Architectural Defense Protocol */}
      <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xs">
        <div className="text-[10px] uppercase font-bold text-sky-400 mb-1 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span>Samuel's Prior Disclosure Safe Harbor</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {active.defense}
        </p>
      </div>
    </div>
  );
};
