"use client";

import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { sound } from "@/lib/audio";
import { TabularAmount } from "./TabularAmount";

interface BilledVsLawfulDiffProps {
  conceptId: string;
}

export const BilledVsLawfulDiff: React.FC<BilledVsLawfulDiffProps> = ({ conceptId }) => {
  if (conceptId === "client_upload_audit") {
    return (
      <div className="my-3 p-3.5 bg-terminal-slate text-ink-primary rounded-lg border border-amber-800/60 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Browser Heuristic Pattern Inspection
          </span>
          <span className="text-amber-400 font-semibold">Demo Heuristic Scanner</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-md">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Execution Boundary</span>
              <ShieldCheck className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Zero External Cloud Calls
            </div>
            <div className="text-blue-400 font-bold text-sm">
              Local Browser
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Parsed in browser memory
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/50 p-2.5 rounded-md">
            <div className="text-[10px] text-amber-300 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Legal Status</span>
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Informational Only
            </div>
            <div className="text-amber-300 font-bold text-sm">
              Demo Pattern Matcher
            </div>
            <div className="text-[10px] text-amber-200/80 mt-1">
              Does not replace formal audit
            </div>
          </div>
        </div>

        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-md flex items-center justify-between cursor-pointer hover:bg-amber-950/60 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DEMO HEURISTIC INSPECTION: NOT A FORMAL STATUTORY AUDIT</span>
          </div>
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Demo Only</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_clean_fob") {
    return (
      <div className="my-3 p-3.5 bg-terminal-slate text-ink-primary rounded-lg border border-emerald-800/60 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 type-caption-mono uppercase text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium text-ink-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Clean Production Invoice: Verified FOB Terms
          </span>
          <span className="text-ink-emerald font-medium">Clean Baseline Verification</span>
        </div>

        <div className="grid grid-cols-2 gap-2 type-mono-data">
          {/* As Billed Column */}
          <div className="bg-emerald-950/30 border border-emerald-900/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-ink-emerald font-medium uppercase mb-1 flex items-center justify-between">
              <span>Vendor Commercial Invoice</span>
              <CheckCircle2 className="w-3 h-3 text-ink-emerald" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              Line 1: 500 pcs × $45.00
            </div>
            <div className="text-ink-emerald font-semibold text-sm tabular-nums">
              <TabularAmount value={22500} />
            </div>
            <div className="type-caption-mono text-emerald-300/80 mt-1">
              Exact mathematical extension
            </div>
          </div>

          {/* Lawful Reconciled Column */}
          <div className="bg-emerald-950/50 border border-emerald-700/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-emerald-300 font-medium uppercase mb-1 flex items-center justify-between">
              <span>Lawful Entered Base</span>
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              FOB Value + Declared Assist
            </div>
            <div className="text-emerald-300 font-semibold text-sm tabular-nums">
              <TabularAmount value={145250} />
            </div>
            <div className="type-caption-mono text-emerald-200/80 mt-1">
              Zero statutory duty loss
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/50 rounded-md flex items-center justify-between cursor-pointer hover:bg-emerald-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 type-caption-mono font-medium text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-ink-emerald" />
            <span>CLEAN FOB BASELINE: ZERO 19 U.S.C. § 1592 DISCREPANCIES DETECTED</span>
          </div>
          <span className="type-caption-mono text-ink-emerald uppercase font-medium">Baseline Verified</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_1_customs") {
    return (
      <div className="my-3 p-3.5 bg-terminal-slate text-ink-primary rounded-lg border border-slate-700/80 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 type-caption-mono uppercase text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium text-ink-cobalt">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-pulse" />
            Billed Invoice vs. Lawful Statutory Base
          </span>
          <span className="statutory-cite text-[12px] text-ink-amber">19 CFR § 152.103 Valuation Defect</span>
        </div>

        <div className="grid grid-cols-2 gap-2 type-mono-data">
          {/* As Billed Column */}
          <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-ink-crimson font-medium uppercase mb-1 flex items-center justify-between">
              <span>As Billed (Vendor)</span>
              <AlertTriangle className="w-3 h-3 text-ink-crimson" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              Line 1: 500 pcs × $45.00
            </div>
            <div className="text-ink-crimson font-semibold text-sm tabular-nums">
              <TabularAmount value={25500} />
            </div>
            <div className="type-caption-mono text-red-300/70 mt-1 line-through decoration-red-400">
              Math: $3,000 arithmetic defect
            </div>
          </div>

          {/* Lawful Reconciled Column */}
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-ink-emerald font-medium uppercase mb-1 flex items-center justify-between">
              <span>Lawful Reconciled Base</span>
              <CheckCircle2 className="w-3 h-3 text-ink-emerald" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              Correct: 500 pcs × $45.00
            </div>
            <div className="text-ink-emerald font-semibold text-sm tabular-nums">
              <TabularAmount value={22500} />
            </div>
            <div className="type-caption-mono text-emerald-300/80 mt-1">
              Lawful entered customs base
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-red-600/20 border border-red-500/50 rounded-md flex items-center justify-between cursor-pointer hover:bg-red-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 type-caption-mono font-medium text-red-300">
            <ShieldCheck className="w-3.5 h-3.5 text-ink-crimson" />
            <span>INTERCEPTED: $3,000.00 OVERBILLING WITHHELD PRE-PAYMENT</span>
          </div>
          <span className="type-caption-mono text-ink-crimson uppercase font-medium">Protected</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_2_freight") {
    return (
      <div className="my-3 p-3.5 bg-terminal-slate text-ink-primary rounded-lg border border-slate-700/80 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 type-caption-mono uppercase text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium text-ink-cobalt">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-pulse" />
            Ocean Carrier Bill vs. Contract Tariff Rate
          </span>
          <span className="statutory-cite text-[12px] text-ink-amber">OSRA 2022 &amp; FMC Docket 21-08</span>
        </div>

        <div className="grid grid-cols-2 gap-2 type-mono-data">
          {/* As Invoiced Column */}
          <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-ink-crimson font-medium uppercase mb-1 flex items-center justify-between">
              <span>Carrier Invoiced Total</span>
              <AlertTriangle className="w-3 h-3 text-ink-crimson" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              Base + Split + FSC + Detention
            </div>
            <div className="text-ink-crimson font-semibold text-sm tabular-nums">
              <TabularAmount value={7047.5} />
            </div>
            <div className="type-caption-mono text-red-300/70 mt-1">
              3 unauthorized accessorial line items
            </div>
          </div>

          {/* Lawful Contract Column */}
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-md">
            <div className="type-caption-mono text-ink-emerald font-medium uppercase mb-1 flex items-center justify-between">
              <span>Lawful Contractual Obligation</span>
              <CheckCircle2 className="w-3 h-3 text-ink-emerald" />
            </div>
            <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
              Base $4,850 + Tariff FSC $650
            </div>
            <div className="text-ink-emerald font-semibold text-sm tabular-nums">
              <TabularAmount value={5500} />
            </div>
            <div className="type-caption-mono text-emerald-300/80 mt-1">
              FMC-compliant rate card
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-red-600/20 border border-red-500/50 rounded-md flex items-center justify-between cursor-pointer hover:bg-red-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 type-caption-mono font-medium text-red-300">
            <ShieldCheck className="w-3.5 h-3.5 text-ink-crimson" />
            <span>INTERCEPTED: $1,547.50 OVERBILLING (21.9% OF CARRIER BILL)</span>
          </div>
          <span className="type-caption-mono text-ink-crimson uppercase font-medium">Withheld</span>
        </div>
      </div>
    );
  }

  // Concept 3: Duty Drawback
  return (
    <div className="my-3 p-3.5 bg-terminal-slate text-ink-primary rounded-lg border border-slate-700/80 shadow-inner font-mono">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 type-caption-mono uppercase text-ink-muted">
        <span className="flex items-center gap-1.5 font-medium text-ink-emerald">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          CBP Form 7501 Duties Paid vs. 99% Re-Export Refund
        </span>
        <span className="statutory-cite text-[12px] text-ink-cobalt">19 U.S.C. § 1313(j)(1)</span>
      </div>

      <div className="grid grid-cols-2 gap-2 type-mono-data">
        {/* Customs Duties Paid */}
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-md">
          <div className="type-caption-mono text-ink-muted font-medium uppercase mb-1">
            Historical Duties Remitted
          </div>
          <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
            Import Entry Summary 7501
          </div>
          <div className="text-ink-numeric font-semibold text-sm tabular-nums">
            <TabularAmount value={27600} />
          </div>
          <div className="type-caption-mono text-ink-muted mt-1">
            Paid to U.S. Customs Treasury
          </div>
        </div>

        {/* Treasury Refund Check */}
        <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-md">
          <div className="type-caption-mono text-ink-emerald font-medium uppercase mb-1 flex items-center justify-between">
            <span>Treasury Direct Cash Refund</span>
            <CheckCircle2 className="w-3 h-3 text-ink-emerald" />
          </div>
          <div className="text-ink-secondary type-caption-mono leading-tight mb-1">
            99% Lawful Statutory Drawback
          </div>
          <div className="text-ink-emerald font-semibold text-sm tabular-nums">
            <TabularAmount value={27324} />
          </div>
          <div className="type-caption-mono text-emerald-300/80 mt-1">
            Direct Wire to Client Treasury
          </div>
        </div>
      </div>

      {/* The Unlock Stamp */}
      <div 
        onClick={() => sound.playLock()}
        className="mt-2.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/50 rounded-md flex items-center justify-between cursor-pointer hover:bg-emerald-600/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 type-caption-mono font-medium text-emerald-300">
          <DollarSign className="w-3.5 h-3.5 text-ink-emerald" />
          <span>MATCH UNLOCKED: $27,324.00 RE-EXPORT DRAWBACK READY TO HARVEST</span>
        </div>
        <span className="type-caption-mono text-ink-emerald uppercase font-medium">Wire Ready</span>
      </div>
    </div>
  );
};
