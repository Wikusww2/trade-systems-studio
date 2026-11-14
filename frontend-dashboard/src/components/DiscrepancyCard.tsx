"use client";

import React, { useState } from "react";
import { Discrepancy } from "@/lib/types";
import {
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
  Shield,
  ChevronDown,
  ChevronUp,
  Scale,
  Zap,
  Eye,
} from "lucide-react";

interface DiscrepancyCardProps {
  discrepancy: Discrepancy;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onFocusMobileDoc?: () => void;
}

export const DiscrepancyCard: React.FC<DiscrepancyCardProps> = ({
  discrepancy,
  isActive,
  onHover,
  onClick,
  onFocusMobileDoc,
}) => {
  const [showDefense, setShowDefense] = useState(false);
  const isUncertain = discrepancy.confidence < 0.85;

  const getSeverityStyle = () => {
    switch (discrepancy.severity) {
      case "critical":
        return {
          badge:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60",
          icon: <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />,
          accent: "text-rose-700 dark:text-rose-400",
          highlightBg: "hover:border-rose-300 dark:hover:border-rose-500/50",
        };
      case "opportunity":
        return {
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />,
          accent: "text-emerald-700 dark:text-emerald-400",
          highlightBg: "hover:border-emerald-300 dark:hover:border-emerald-500/50",
        };
      case "warning":
      default:
        return {
          badge:
            "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
          accent: "text-amber-700 dark:text-amber-400",
          highlightBg: "hover:border-amber-300 dark:hover:border-amber-500/50",
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div
      id={`card-${discrepancy.id}`}
      onMouseEnter={() => onHover(discrepancy.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(discrepancy.id)}
      className={`p-4 transition-all duration-200 cursor-pointer border rounded-sm ${
        isActive
          ? "bg-sky-50/70 dark:bg-[#1C212B] border-sky-500 dark:border-sky-400 ring-1 ring-sky-500 dark:ring-sky-400 shadow-sm dark:shadow-lg"
          : isUncertain
          ? "bg-amber-50/20 dark:bg-[#15181E] border-dashed border-amber-400 dark:border-amber-500/80 hover:border-amber-500"
          : `bg-white dark:bg-[#15181E] border-slate-200 dark:border-[#262B35] ${style.highlightBg}`
      }`}
    >
      {/* Top Metadata Strip */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {style.icon}
          <span
            className={`text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 border rounded-xs font-semibold ${style.badge}`}
          >
            {discrepancy.severity}
          </span>
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-black/40 px-2 py-0.5 border border-slate-200 dark:border-[#2A2F3A] rounded-xs">
            {discrepancy.statutory_code}
          </span>
        </div>

        {/* Visual Uncertainty Indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-mono ${
              isUncertain ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-500 dark:text-slate-400"
            }`}
            title={
              isUncertain
                ? "Low Confidence Detection (<85%) — Human Audit Review Required"
                : "High Confidence Extraction"
            }
          >
            {(discrepancy.confidence * 100).toFixed(0)}% CONF
          </span>
          {isUncertain && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-amber-400"></span>
            </span>
          )}
        </div>
      </div>

      {/* Discrepancy Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 flex items-start justify-between gap-2">
        <span>{discrepancy.title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
      </h4>

      {/* Executive Summary Callout */}
      {discrepancy.executive_summary && (
        <div className="text-xs text-sky-900 dark:text-sky-200/90 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 px-2.5 py-1.5 rounded-sm mb-2.5 flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{discrepancy.executive_summary}</span>
        </div>
      )}

      {/* Rationale Description */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
        {discrepancy.description}
      </p>

      {/* Financial Blast Radius Line */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-[#262B35]">
        <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider">
          {discrepancy.severity === "opportunity"
            ? "Unlocked Cash Refund"
            : "Statutory Financial Exposure"}
        </span>
        <span className={`text-sm font-mono font-bold ${style.accent}`}>
          {discrepancy.exposure_amount > 0
            ? `$${discrepancy.exposure_amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "Valuation Defect"}
        </span>
      </div>

      {/* Mobile Focus Button */}
      {onFocusMobileDoc && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFocusMobileDoc();
          }}
          className="lg:hidden mt-2.5 w-full py-1.5 px-3 bg-slate-100 dark:bg-[#202530] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-mono flex items-center justify-center gap-1.5 rounded-xs"
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          <span>View Coordinates on Document</span>
        </button>
      )}

      {/* Interactive Architectural Defense Accordion */}
      {discrepancy.statutory_defense && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-[#262B35]/60">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDefense(!showDefense);
            }}
            className="w-full flex items-center justify-between text-[11px] font-mono text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3 h-3" />
              <span>Samuel&apos;s Architectural Defense Protocol</span>
            </span>
            {showDefense ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDefense && (
            <div className="mt-1.5 p-2.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-sky-900/40 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed rounded-sm">
              <div className="font-semibold text-sky-700 dark:text-sky-300 mb-1 flex items-center gap-1">
                <Scale className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>Statutory Remediation Strategy:</span>
              </div>
              <p>{discrepancy.statutory_defense}</p>
            </div>
          )}
        </div>
      )}

      {isUncertain && (
        <div className="mt-2 text-[10px] font-mono text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5 rounded-sm">
          <HelpCircle className="w-3 h-3 shrink-0" />
          <span>Requires Manual Specialist Verification (Confidence &lt; 85%)</span>
        </div>
      )}
    </div>
  );
};
