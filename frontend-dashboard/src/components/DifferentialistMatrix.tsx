"use client";

import React from "react";
import { Check, X, Shield, Zap, Sparkles, Lock, DollarSign } from "lucide-react";
import { sound } from "@/lib/audio";

interface DifferentialistMatrixProps {
  onOpenConsultation: () => void;
}

export const DifferentialistMatrix: React.FC<DifferentialistMatrixProps> = ({
  onOpenConsultation,
}) => {
  return (
    <section className="py-12 lg:py-16 border-b border-slate-200 dark:border-[#262B35] bg-white dark:bg-[#11141A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs mb-3">
            <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>Differential Market Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Why Enterprise Importers Retain Samuel Over Status-Quo Audits
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Traditional Big 4 auditing checks samples months after cash has left the bank. Legacy SaaS requires 9-month ERP overhauls. Samuel delivers instant, deterministic pre-payment interception.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sans text-xs text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold w-1/4">Evaluation Dimension</th>
                <th className="py-3 px-4 font-semibold text-slate-500 w-1/4">
                  Legacy SaaS (Flexport, Descartes)
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 w-1/4">
                  Traditional Big 4 (EY, Deloitte)
                </th>
                <th className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 border-x border-t border-sky-200 dark:border-sky-800/60 rounded-t-sm w-1/4">
                  Samuel's Autonomous Engine
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                  Detection Velocity
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    Batched daily / weekly sync
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    3 to 6 months post-payment
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-sky-50/30 dark:bg-sky-950/20 border-x border-sky-200 dark:border-sky-800/60">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    &lt; 180 ms Pre-Payment Gate
                  </span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                  Mathematical Integrity
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Cloud OCR heuristics (floating point rounding drift)
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Manual spreadsheet sampling (human error prone)
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-sky-50/30 dark:bg-sky-950/20 border-x border-sky-200 dark:border-sky-800/60">
                  <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                    <Check className="w-4 h-4 text-sky-500 shrink-0" />
                    100% Python Decimal Math (Zero LLM Arithmetic)
                  </span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                  Cash Flow Actionability
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Passive analytics dashboard (carrier already paid)
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Post-audit clawback disputes (low recovery rate)
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-sky-50/30 dark:bg-sky-950/20 border-x border-sky-200 dark:border-sky-800/60">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    Immediate Remittance Withholding
                  </span>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                  Data Sovereignty & Privacy
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Multi-tenant cloud OCR (data processed in shared queues)
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  Offshore manual document entry teams
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-sky-50/30 dark:bg-sky-950/20 border-x border-sky-200 dark:border-sky-800/60">
                  <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                    <Check className="w-4 h-4 text-sky-500 shrink-0" />
                    Local Docling Engine • Zero Cloud Retention
                  </span>
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                  Fee Alignment & Risk
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  $50k–$150k annual software license (zero recovery guarantee)
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  $650/hour billable minimums regardless of outcome
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-sky-50/30 dark:bg-sky-950/20 border-x border-b border-sky-200 dark:border-sky-800/60 rounded-b-sm">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    $0 Upfront • 100% Contingent on Cash Recovered
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Direct Action Callout */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-[#14171E] border border-slate-200 dark:border-[#262B35] rounded-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              S
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Direct Principal Engagement with Samuel
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                No junior consultants, no offshored data. Custom architecture built by the founder.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playLock();
              onOpenConsultation();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-sm"
          >
            Claim 25-Invoice Audit ($0)
          </button>
        </div>
      </div>
    </section>
  );
};
