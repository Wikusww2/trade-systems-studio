"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, ShieldAlert, FileCheck2, ArrowRight } from "lucide-react";

export interface Scenario {
  id: string;
  name: string;
  route: string;
  concept_id: string;
  risk_type: string;
  statutory_code: string;
  default_exposure: string;
  severity: "critical" | "warning" | "opportunity";
}

export const CORRIDOR_SCENARIOS: Scenario[] = [
  {
    id: "scenario_durban_rotterdam",
    name: "Port of Durban to Rotterdam Electronics",
    route: "ZADUR -> NLRTM",
    concept_id: "concept_1_customs",
    risk_type: "CIF Marine Insurance Omission & GRI 3(b) Reclassification",
    statutory_code: "19 U.S.C. § 1592 & 19 CFR § 152.103",
    default_exposure: "$36,000",
    severity: "critical"
  },
  {
    id: "scenario_long_beach_battery",
    name: "Trans-Pacific to Long Beach Lithium-Ion Pack",
    route: "CNSZX -> USLAX",
    concept_id: "concept_2_freight",
    risk_type: "Section 301 Secondary Tariff & Chassis Split Surcharge",
    statutory_code: "19 U.S.C. § 1592 & FMC Docket 21-08",
    default_exposure: "$48,200",
    severity: "critical"
  },
  {
    id: "scenario_steel_drawback",
    name: "Cross-Border Steel Assembly Unused Merchandise",
    route: "KRINC -> USHOU",
    concept_id: "concept_3_drawback",
    risk_type: "Unclaimed 99% Section 1313 Duty Drawback",
    statutory_code: "19 U.S.C. § 1313",
    default_exposure: "$18,400",
    severity: "opportunity"
  }
];

interface ScenarioSelectorBarProps {
  activeScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioSelectorBar: React.FC<ScenarioSelectorBarProps> = ({
  activeScenarioId,
  onSelectScenario
}) => {
  return (
    <div className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl p-3 mb-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Load Sample Trade Corridor Scenario:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CORRIDOR_SCENARIOS.map((sc) => {
            const isActive = sc.id === activeScenarioId;
            return (
              <motion.button
                key={sc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectScenario(sc)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm"
                    : "bg-[#1E293B] text-slate-300 hover:text-white border-[#334155]/60 hover:border-slate-500"
                }`}
              >
                {sc.severity === "critical" ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-semibold">{sc.name}</span>
                <span className="text-[10px] text-slate-400">({sc.route})</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    sc.severity === "critical"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {sc.default_exposure}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
