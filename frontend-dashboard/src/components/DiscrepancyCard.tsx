"use client";

import React, { useState } from "react";
import { Discrepancy } from "@/lib/types";
import { sound } from "@/lib/audio";
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
  Crosshair,
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
  const [showCitation, setShowCitation] = useState(false);
  const isUncertain = discrepancy.confidence < 0.85;

  const getSeverityStyle = () => {
    switch (discrepancy.severity) {
      case "critical":
        return {
          badge:
            "bg-red-500/10 text-red-400 border-red-500/30",
          icon: <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />,
          accent: "text-red-400",
          highlightBg: "hover:border-red-500/50",
        };
      case "opportunity":
        return {
          badge:
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />,
          accent: "text-emerald-400",
          highlightBg: "hover:border-emerald-500/50",
        };
      case "warning":
      default:
        return {
          badge:
            "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          accent: "text-amber-400",
          highlightBg: "hover:border-amber-500/50",
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
      className={`p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] cursor-pointer border rounded-lg ${
        isActive
          ? "bg-[#1E293B] border-blue-500 ring-1 ring-blue-500 shadow-xl shadow-blue-500/10"
          : isUncertain
          ? "bg-[#0F172A] border-dashed border-amber-500/70 hover:border-amber-400"
          : `bg-[#0F172A] border-[#1F2937] ${style.highlightBg}`
      }`}
    >
      {/* Top Metadata Strip */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {style.icon}
          <span
            className={`text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 border rounded-md font-semibold ${style.badge}`}
          >
            {discrepancy.severity}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 border border-slate-800 rounded-md">
            {discrepancy.statutory_code}
          </span>
        </div>

        {/* Confidence Telemetry */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-slate-400">
          <span className={isUncertain ? "text-amber-400 font-bold" : "text-slate-400"}>
            {(discrepancy.confidence * 100).toFixed(0)}% CONF
          </span>
          {isUncertain && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          )}
        </div>
      </div>

      {/* Discrepancy Title */}
      <h3 className="text-sm font-semibold text-slate-100 mb-1 flex items-start justify-between gap-2">
        <span>{discrepancy.title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
      </h3>

      {/* Concise Summary / Core Finding */}
      <p className="text-xs text-slate-300 leading-snug mb-2 line-clamp-2">
        {discrepancy.executive_summary || discrepancy.description}
      </p>

      {/* Financial Blast Radius Line */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          {discrepancy.severity === "opportunity"
            ? "Recoverable Cash Margin"
            : "Statutory Financial Exposure"}
        </span>
        <span className={`text-sm font-mono font-bold tabular-nums ${style.accent}`}>
          {discrepancy.exposure_amount > 0
            ? `$${discrepancy.exposure_amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "Valuation Defect"}
        </span>
      </div>

      {/* Progressive Disclosure: Collapsible Statutory Legal Citation */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowCitation(!showCitation);
          }}
          className="w-full flex items-center justify-between text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Scale className="w-3 h-3" />
            <span>Read Statutory Citation & Analysis</span>
          </span>
          {showCitation ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showCitation && (
          <div className="mt-2 p-2.5 bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed rounded-md space-y-2">
            <p className="font-serif italic text-slate-400 border-l-2 border-blue-500 pl-2">
              {discrepancy.description}
            </p>
            {discrepancy.statutory_defense && (
              <div className="pt-1.5 border-t border-slate-800">
                <span className="font-semibold text-blue-400 block mb-0.5 font-mono text-[10px] uppercase">
                  Remediation Protocol:
                </span>
                <p>{discrepancy.statutory_defense}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile & Tablet Locate on PDF Button with Pseudo-Haptic Recoil */}
      {onFocusMobileDoc && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFocusMobileDoc();
          }}
          className="lg:hidden mt-2.5 w-full py-2 px-3 bg-blue-950/80 hover:bg-blue-900/80 active:scale-[0.98] text-blue-300 border border-blue-700/60 hover:border-blue-500 text-xs font-mono font-semibold flex items-center justify-center gap-2 rounded-md transition-all shadow-xs"
        >
          <Crosshair className="w-3.5 h-3.5 text-blue-400" />
          <span>Locate on Source PDF</span>
        </button>
      )}
    </div>
  );
};
