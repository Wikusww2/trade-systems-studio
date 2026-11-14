"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, DollarSign, TrendingUp } from "lucide-react";

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

  const totalFinancialImpact =
    projectedCarrierRecovery + projectedCustomsDefense + projectedDrawbackRefund;

  return (
    <div className="bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#262B35] rounded-sm p-5 sm:p-6 lg:p-8 shadow-sm dark:shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-[#262B35]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 font-semibold rounded-xs">
              Deterministic Value Model
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Based on 19 U.S.C. § 1592 & FMC Audit Baselines
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Enterprise Financial Recovery & Defense Calculator</span>
          </h3>
        </div>

        <div className="md:text-right bg-slate-50 dark:bg-[#0B0D11] p-3 md:p-0 rounded-sm md:bg-transparent">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Projected 12-Month Balance Sheet Impact
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">
            ${totalFinancialImpact.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
        {/* Slider 1: Annual Ocean Containers */}
        <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#202530] p-4 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              Annual Inbound Containers
            </label>
            <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
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
            className="w-full accent-sky-600 dark:accent-sky-400 h-1.5 bg-slate-200 dark:bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-1.5">
            <span>50</span>
            <span>2,500</span>
            <span>5,000</span>
          </div>
        </div>

        {/* Slider 2: Annual International Freight Spend */}
        <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#202530] p-4 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              Annual Ocean Freight Spend
            </label>
            <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
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
            className="w-full accent-sky-600 dark:accent-sky-400 h-1.5 bg-slate-200 dark:bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-1.5">
            <span>$250k</span>
            <span>$10M</span>
            <span>$20M+</span>
          </div>
        </div>

        {/* Slider 3: Customs Entered Merchandise Value */}
        <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#202530] p-4 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              Annual Dutiable Import Value
            </label>
            <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
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
            className="w-full accent-sky-600 dark:accent-sky-400 h-1.5 bg-slate-200 dark:bg-slate-800 cursor-pointer rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-1.5">
            <span>$1M</span>
            <span>$50M</span>
            <span>$100M+</span>
          </div>
        </div>
      </div>

      {/* 3 Outcome Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-rose-50/50 dark:bg-[#0E1015] border border-rose-200 dark:border-rose-900/30 rounded-sm">
          <div className="text-[10px] font-mono uppercase text-rose-700 dark:text-rose-400 tracking-wider mb-1 font-semibold">
            19 U.S.C. § 1592 Defense Avoidance
          </div>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mb-1">
            ${projectedCustomsDefense.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Protected capital from automated tariff misclassification and valuation assist errors.
          </p>
        </div>

        <div className="p-4 bg-sky-50/50 dark:bg-[#0E1015] border border-sky-200 dark:border-sky-900/30 rounded-sm">
          <div className="text-[10px] font-mono uppercase text-sky-700 dark:text-sky-400 tracking-wider mb-1 font-semibold">
            Pre-Payment Freight Overbilling
          </div>
          <div className="text-xl font-mono font-bold text-sky-600 dark:text-sky-400 mb-1">
            ${projectedCarrierRecovery.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Direct cash withheld before carrier payment on chassis splits, detention inside free time, and inflated FSC.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-[#0E1015] border border-emerald-200 dark:border-emerald-900/30 rounded-sm">
          <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 tracking-wider mb-1 font-semibold">
            99% Duty Drawback Unlocked
          </div>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            ${projectedDrawbackRefund.toLocaleString("en-US")}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Direct Treasury cash refunds unlocked by matching historical export B/Ls against imported consumption entries.
          </p>
        </div>
      </div>

      {/* Bottom CTA Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-100 dark:bg-[#1A202C]/60 border border-slate-200 dark:border-[#2D3748] rounded-sm">
        <div className="text-xs text-slate-700 dark:text-slate-300 text-center sm:text-left">
          <span className="font-semibold text-slate-900 dark:text-white">
            Want Samuel to verify these numbers against your actual rate cards?
          </span>{" "}
          Submit 25 invoices under our $0-upfront contingent diagnostic audit.
        </div>
        <button
          onClick={onOpenConsultation}
          className="w-full sm:w-auto whitespace-nowrap px-5 py-2.5 bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-sm shrink-0 shadow-sm"
        >
          <span>Claim Free 25-Invoice Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
