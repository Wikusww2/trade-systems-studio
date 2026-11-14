"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, DollarSign, TrendingUp, Cpu } from "lucide-react";

interface RoiCalculatorProps {
  onOpenConsultation: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenConsultation }) => {
  const [containersPerYear, setContainersPerYear] = useState<number>(500);
  const [freightSpend, setFreightSpend] = useState<number>(2500000); // $2.5M
  const [customsDutiableValue, setCustomsDutiableValue] = useState<number>(12000000); // $12M

  // Deterministic Industry Baselines
  // 1. Carrier Overbilling: 7.5% of annual freight spend
  const projectedCarrierRecovery = Math.round(freightSpend * 0.075);

  // 2. 19 U.S.C. § 1592 Penalty Exposure Avoided (Avg 2.5% entry anomaly rate, 2x duty loss)
  const projectedCustomsDefense = Math.round(customsDutiableValue * 0.015);

  // 3. Re-export Duty Drawback (Assuming 15% re-export rate, 5% duty, 99% drawback)
  const projectedDrawbackRefund = Math.round(customsDutiableValue * 0.15 * 0.05 * 0.99);

  // 4. CargoWise Value Pack Exception & Rework Savings
  // Post-Dec 1 2025 Value Pack transaction fee ($8/shipment) + average manual exception rework ($85/shipment on 12% failed XML transmissions)
  const projectedValuePackReworkSaved = Math.round(containersPerYear * 0.12 * 85 + containersPerYear * 8);

  const totalFinancialImpact =
    projectedCarrierRecovery + projectedCustomsDefense + projectedDrawbackRefund + projectedValuePackReworkSaved;

  return (
    <div className="bg-[#0F172A] border border-[#1F2937] rounded-xl p-5 sm:p-6 lg:p-8 shadow-2xl text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-950/80 border border-blue-800 text-blue-400 font-semibold rounded-md">
              Deterministic Value Model
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Based on 19 U.S.C. § 1592, FMC Docket 21-08, and CargoWise Value Pack Baselines
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-sans tracking-tight">
            <Calculator className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Enterprise Financial Recovery and CargoWise Value Pack Calculator</span>
          </h3>
        </div>

        <div className="md:text-right bg-[#0B0F19] p-3 md:p-3 rounded-lg border border-[#1F2937]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Projected 12-Month Balance Sheet Impact
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
            ${totalFinancialImpact.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
        {/* Slider 1: Annual Ocean Containers */}
        <div className="bg-[#0B0F19] border border-[#1F2937] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-300">
              Annual Inbound Containers
            </label>
            <span className="text-xs font-mono font-bold text-blue-400 tabular-nums">
              {containersPerYear.toLocaleString("en-US")} FEU
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={containersPerYear}
            onChange={(e) => {
              const val = Number(e.target.value);
              setContainersPerYear(val);
              setFreightSpend(val * 4500);
            }}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 tabular-nums">
            <span>50</span>
            <span>2,500</span>
            <span>5,000</span>
          </div>
        </div>

        {/* Slider 2: Annual Ocean Freight Spend */}
        <div className="bg-[#0B0F19] border border-[#1F2937] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-300">
              Annual Ocean Freight Spend
            </label>
            <span className="text-xs font-mono font-bold text-blue-400 tabular-nums">
              ${(freightSpend / 1000000).toFixed(2)}M USD
            </span>
          </div>
          <input
            type="range"
            min={250000}
            max={20000000}
            step={250000}
            value={freightSpend}
            onChange={(e) => setFreightSpend(Number(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 tabular-nums">
            <span>$250k</span>
            <span>$10M</span>
            <span>$20M+</span>
          </div>
        </div>

        {/* Slider 3: Customs Entered Merchandise Value */}
        <div className="bg-[#0B0F19] border border-[#1F2937] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-300">
              Annual Dutiable Import Value
            </label>
            <span className="text-xs font-mono font-bold text-blue-400 tabular-nums">
              ${(customsDutiableValue / 1000000).toFixed(1)}M USD
            </span>
          </div>
          <input
            type="range"
            min={1000000}
            max={100000000}
            step={1000000}
            value={customsDutiableValue}
            onChange={(e) => setCustomsDutiableValue(Number(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 tabular-nums">
            <span>$1M</span>
            <span>$50M</span>
            <span>$100M+</span>
          </div>
        </div>
      </div>

      {/* 4 Outcome Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#0B0F19] border border-rose-900/40 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-rose-400 tracking-wider mb-1 font-semibold">
            19 U.S.C. § 1592 Avoidance
          </div>
          <div className="text-xl font-mono font-bold text-rose-400 mb-1 tabular-nums">
            ${projectedCustomsDefense.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Protected capital from automated tariff misclassification and valuation assist errors.
          </p>
        </div>

        <div className="p-4 bg-[#0B0F19] border border-blue-900/40 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-blue-400 tracking-wider mb-1 font-semibold">
            Pre-Payment Overbilling
          </div>
          <div className="text-xl font-mono font-bold text-blue-400 mb-1 tabular-nums">
            ${projectedCarrierRecovery.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Direct cash withheld before carrier payment on chassis splits, detention inside free time, and inflated FSC.
          </p>
        </div>

        <div className="p-4 bg-[#0B0F19] border border-emerald-900/40 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider mb-1 font-semibold">
            99% Duty Drawback
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mb-1 tabular-nums">
            ${projectedDrawbackRefund.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Direct Treasury cash refunds unlocked by matching historical export B/Ls against imported consumption entries.
          </p>
        </div>

        <div className="p-4 bg-[#0B0F19] border border-amber-900/40 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider mb-1 font-semibold">
            CargoWise Value Pack Offset
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 mb-1 tabular-nums">
            ${projectedValuePackReworkSaved.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Eliminates rejected eAdaptor XML re-submissions ($8/fee) and costly exception rework ($85/hr).
          </p>
        </div>
      </div>

      {/* Bottom CTA Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-lg">
        <div className="text-xs text-slate-300 text-center sm:text-left">
          <span className="font-semibold text-white">
            Want Samuel to verify these numbers against your actual rate cards?
          </span>{" "}
          Submit 50 historical bills under our $0-upfront contingent diagnostic audit.
        </div>
        <button
          onClick={onOpenConsultation}
          className="w-full sm:w-auto whitespace-nowrap px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-md shrink-0 shadow-md"
        >
          <span>Claim Free 50-Bill Audit ($0)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
