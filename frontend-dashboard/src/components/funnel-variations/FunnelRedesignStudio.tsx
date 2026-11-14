"use client";

import React, { useState } from "react";
import { FunnelVariationA_CfoRecovery } from "./FunnelVariationA_CfoRecovery";
import { FunnelVariationB_LegalDefense } from "./FunnelVariationB_LegalDefense";
import {
  DollarSign,
  Scale,
  Sparkles,
  Layout,
  Layers,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Coins,
} from "lucide-react";
import { sound } from "@/lib/audio";

export type FunnelVariationMode = "variation_a" | "variation_b";

interface FunnelRedesignStudioProps {
  initialMode?: FunnelVariationMode;
  onClose?: () => void;
}

export const FunnelRedesignStudio: React.FC<FunnelRedesignStudioProps> = ({
  initialMode = "variation_a",
  onClose,
}) => {
  const [activeVariation, setActiveVariation] = useState<FunnelVariationMode>(initialMode);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Variation Switcher Header Bar */}
      <div className="bg-[#14171E] border border-[#262B35] p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-mono font-bold text-xs">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Funnel Redesign Lab
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 bg-[#1E2533] text-sky-300 border border-slate-700 rounded-xs">
                Local 2-Variation Testing Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Comparing Value-First (CFO) vs. Risk-First (General Counsel) Conversion Choreography
            </p>
          </div>
        </div>

        {/* Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0E1015] border border-[#262B35] rounded-xs font-mono text-xs">
          <button
            onClick={() => {
              sound.playLock();
              setActiveVariation("variation_a");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-semibold transition-all ${
              activeVariation === "variation_a"
                ? "bg-emerald-950/80 border border-emerald-600 text-emerald-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Variation A: CFO Recovery</span>
          </button>

          <button
            onClick={() => {
              sound.playLock();
              setActiveVariation("variation_b");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-semibold transition-all ${
              activeVariation === "variation_b"
                ? "bg-rose-950/80 border border-rose-600 text-rose-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span>Variation B: Legal Defense</span>
          </button>
        </div>
      </div>

      {/* Render Active Variation */}
      <div className="transition-all duration-200">
        {activeVariation === "variation_a" ? (
          <FunnelVariationA_CfoRecovery onClose={onClose} />
        ) : (
          <FunnelVariationB_LegalDefense onClose={onClose} />
        )}
      </div>

      {/* Strategic Explanation Cards for the Reviewer / ICP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-2">
        <div className={`p-3.5 bg-[#11141A] border rounded-sm ${activeVariation === "variation_a" ? "border-emerald-800/80 bg-emerald-950/10" : "border-[#262B35]"}`}>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Why Variation A Converts the CFO & Controller:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            CFOs are motivated by EBITDA protection and cash recovery. Leading with 5%–15% carrier overbilling leakage, an interactive 25-invoice audit simulator, and a $0-upfront / 15% success-only contingency fee eliminates procurement resistance. They feel dumb not to convert because doing nothing literally forfeits cash.
          </p>
        </div>

        <div className={`p-3.5 bg-[#11141A] border rounded-sm ${activeVariation === "variation_b" ? "border-rose-800/80 bg-rose-950/10" : "border-[#262B35]"}`}>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Why Variation B Converts the General Counsel & VP Trade:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Legal and trade compliance leads are motivated by catastrophic risk mitigation. Leading with 19 U.S.C. § 1592 civil penalties (0.25x to 100% domestic value) and an instant 19 CFR § 162.74 Prior Disclosure generator offers legal safe-harbor before CBP issues a Form 28 / 29 inquiry.
          </p>
        </div>
      </div>
    </div>
  );
};
