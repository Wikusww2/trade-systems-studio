"use client";

import React from "react";
import { ShieldCheck, Cpu, Briefcase, Check, ArrowRight, Sparkles } from "lucide-react";

interface ExecutiveServicesProps {
  onSelectTier: (tier: string) => void;
}

export const ExecutiveServices: React.FC<ExecutiveServicesProps> = ({ onSelectTier }) => {
  return (
    <section id="services-menu" className="py-12 border-t border-slate-200 dark:border-[#262B35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 font-semibold rounded-xs">
              Engagement Menu
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Direct Principal Advisory & Engineering
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            How Enterprises Retain Samuel
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            From high-velocity contingent audit recovery to private on-premise trade audit pipeline deployment, choose the exact engagement model that matches your enterprise supply chain scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TIER 1 */}
          <div className="bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#262B35] hover:border-emerald-500/50 transition-all rounded-sm p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-[#0B0D11] border border-emerald-200 dark:border-[#202530] text-emerald-600 dark:text-emerald-400 rounded-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold rounded-xs">
                  ZERO RISK / $0 UPFRONT
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                Blind Diagnostic Audit Sprint
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                A rapid, zero-friction historical audit of 25 to 100 historical import entries, commercial invoices, and carrier bills.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-[#202530]">
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  $0 Upfront
                </div>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 font-semibold">
                  100% Contingent on Cash Recovered (15% Success Fee)
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Comprehensive 19 U.S.C. § 1592 penalty exposure scan</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Carrier accessorial & chassis overbilling audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>5-Year statutory duty drawback refund matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Executive visual evidence report with bounding box citations</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier("contingent_audit")}
              className="w-full py-2.5 bg-slate-100 dark:bg-[#202530] hover:bg-slate-200 dark:hover:bg-[#2B3240] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-[#3A4252] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-sm"
            >
              <span>Submit 25 Historical Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIER 2 - RECOMMENDED */}
          <div className="bg-sky-50/30 dark:bg-[#171C26] border-2 border-sky-500 dark:border-sky-400/80 rounded-sm p-6 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 font-mono text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Most High-Leverage</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-sky-100 dark:bg-[#0B0D11] border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400 rounded-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300 font-bold rounded-xs">
                  BESPOKE ENGINEERING
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                Private On-Premise Audit Pipeline Deployment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Turnkey integration of Samuel&apos;s deterministic trade calculation and local layout parser into your ERP (SAP, CargoWise, NetSuite).
              </p>

              <div className="mb-6 pb-6 border-b border-sky-200 dark:border-[#263040]">
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  $15,000 – $45,000
                </div>
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 mt-0.5 font-semibold">
                  Fixed Investment • Zero Cloud API Data Leakage
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>On-premise / private cloud Docling layout extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>Strict Python Decimal financial & customs math engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>Custom WCO GRI 1–6 classification logic rulesets</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>Automated EDI carrier pre-audit & payment hold gates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>Full test suite, API documentation, and architecture handoff</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier("custom_pipeline")}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-sm shadow-sm"
            >
              <span>Commission Custom Engine Build</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIER 3 */}
          <div className="bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#262B35] hover:border-amber-500/50 transition-all rounded-sm p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 dark:bg-[#0B0D11] border border-amber-200 dark:border-[#202530] text-amber-600 dark:text-amber-400 rounded-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold rounded-xs">
                  RETAINED ADVISORY
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                Fractional Systems Architect & Defense Counsel
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Ongoing strategic partnership overseeing global customs compliance firewalls, tariff engineering, and high-stakes audits.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-[#202530]">
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  $7,500 / month
                </div>
                <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 mt-0.5 font-semibold">
                  Monthly Retainer • Direct Access to Samuel
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Prior disclosure filings under 19 CFR § 162.74</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Proactive tariff engineering & USMCA / preferential rule claims</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Carrier contract rate card negotiation & dispute arbitration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Dedicated weekly executive advisory & systems roadmap reviews</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier("fractional_advisory")}
              className="w-full py-2.5 bg-slate-100 dark:bg-[#202530] hover:bg-slate-200 dark:hover:bg-[#2B3240] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-[#3A4252] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-sm"
            >
              <span>Schedule Strategic Fit Call</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
