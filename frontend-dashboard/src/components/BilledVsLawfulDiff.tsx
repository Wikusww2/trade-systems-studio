"use client";

import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { sound } from "@/lib/audio";

interface BilledVsLawfulDiffProps {
  conceptId: string;
}

export const BilledVsLawfulDiff: React.FC<BilledVsLawfulDiffProps> = ({ conceptId }) => {
  if (conceptId === "client_upload_audit") {
    return (
      <div className="my-3 p-3.5 bg-slate-900 text-white rounded-sm border border-sky-800/60 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Client-Side Confidential Document Audit
          </span>
          <span className="text-sky-400 font-semibold">100% On-Device Sandbox</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-sky-950/30 border border-sky-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-sky-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Security &amp; Privacy</span>
              <ShieldCheck className="w-3 h-3 text-sky-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Zero External Cloud Calls
            </div>
            <div className="text-sky-300 font-bold text-sm">
              Local Web Worker
            </div>
            <div className="text-[10px] text-sky-200/70 mt-1">
              Parsed in browser memory
            </div>
          </div>

          <div className="bg-sky-950/50 border border-sky-700/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-sky-300 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Statutory Engine</span>
              <CheckCircle2 className="w-3 h-3 text-sky-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              19 U.S.C. § 1592 &amp; Incoterms
            </div>
            <div className="text-emerald-400 font-bold text-sm">
              Active Defense Gate
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-1">
              Deterministic verification
            </div>
          </div>
        </div>

        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-sky-600/20 border border-sky-500/50 rounded-xs flex items-center justify-between cursor-pointer hover:bg-sky-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>CONFIDENTIAL AUDIT COMPLETE: READY FOR ENTERPRISE INTEGRATION</span>
          </div>
          <span className="text-[10px] text-sky-400 uppercase font-semibold">Protected</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_clean_fob") {
    return (
      <div className="my-3 p-3.5 bg-slate-900 text-white rounded-sm border border-emerald-800/60 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Clean Production Invoice: Verified FOB Terms
          </span>
          <span className="text-emerald-400 font-semibold">100% Pre-Clearance Certified</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* As Billed Column */}
          <div className="bg-emerald-950/30 border border-emerald-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Vendor Commercial Invoice</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Line 1: 500 pcs × $45.00
            </div>
            <div className="text-emerald-400 font-bold text-sm">
              $22,500.00
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1">
              Exact mathematical extension
            </div>
          </div>

          {/* Lawful Reconciled Column */}
          <div className="bg-emerald-950/50 border border-emerald-700/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-emerald-300 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Lawful Entered Base</span>
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              FOB Value + Declared Assist
            </div>
            <div className="text-emerald-300 font-bold text-sm">
              $145,250.00
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-1">
              Zero statutory duty loss
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/50 rounded-xs flex items-center justify-between cursor-pointer hover:bg-emerald-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>VERIFIED: 100% CLEAN COMMERCIAL DECLARATION — ZERO PENALTY RISK</span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Pre-Cleared</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_1_customs") {
    return (
      <div className="my-3 p-3.5 bg-slate-900 text-white rounded-sm border border-slate-700/80 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Billed Invoice vs. Lawful Statutory Base
          </span>
          <span className="text-amber-400 font-semibold">19 CFR § 152.103 Valuation Defect</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* As Billed Column */}
          <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-rose-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>As Billed (Vendor)</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Line 1: 500 pcs × $45.00
            </div>
            <div className="text-rose-400 font-bold text-sm">
              $25,500.00
            </div>
            <div className="text-[10px] text-rose-300/70 mt-1 line-through decoration-rose-400">
              Math: $3,000 arithmetic defect
            </div>
          </div>

          {/* Lawful Reconciled Column */}
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Lawful Reconciled Base</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Correct: 500 pcs × $45.00
            </div>
            <div className="text-emerald-400 font-bold text-sm">
              $22,500.00
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1">
              Lawful entered customs base
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-rose-600/20 border border-rose-500/50 rounded-xs flex items-center justify-between cursor-pointer hover:bg-rose-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>INTERCEPTED: $3,000.00 OVERBILLING WITHHELD PRE-PAYMENT</span>
          </div>
          <span className="text-[10px] text-rose-400 uppercase font-semibold">Protected</span>
        </div>
      </div>
    );
  }

  if (conceptId === "concept_2_freight") {
    return (
      <div className="my-3 p-3.5 bg-slate-900 text-white rounded-sm border border-slate-700/80 shadow-inner font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Ocean Carrier Bill vs. Contract Tariff Rate
          </span>
          <span className="text-amber-400 font-semibold">OSRA 2022 & FMC Docket 21-08</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* As Invoiced Column */}
          <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-rose-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Carrier Invoiced Total</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Base + Split + FSC + Detention
            </div>
            <div className="text-rose-400 font-bold text-sm">
              $7,047.50
            </div>
            <div className="text-[10px] text-rose-300/70 mt-1">
              3 unauthorized accessorial line items
            </div>
          </div>

          {/* Lawful Contract Column */}
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xs">
            <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span>Lawful Contractual Obligation</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-slate-300 text-[11px] leading-tight mb-1">
              Base $4,850 + Tariff FSC $650
            </div>
            <div className="text-emerald-400 font-bold text-sm">
              $5,500.00
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1">
              FMC-compliant rate card
            </div>
          </div>
        </div>

        {/* The Intercept Stamp */}
        <div 
          onClick={() => sound.playLock()}
          className="mt-2.5 px-3 py-1.5 bg-rose-600/20 border border-rose-500/50 rounded-xs flex items-center justify-between cursor-pointer hover:bg-rose-600/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>INTERCEPTED: $1,547.50 OVERBILLING (21.9% OF CARRIER BILL)</span>
          </div>
          <span className="text-[10px] text-rose-400 uppercase font-semibold">Withheld</span>
        </div>
      </div>
    );
  }

  // Concept 3: Duty Drawback
  return (
    <div className="my-3 p-3.5 bg-slate-900 text-white rounded-sm border border-slate-700/80 shadow-inner font-mono">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-wider uppercase text-slate-400">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          CBP Form 7501 Duties Paid vs. 99% Re-Export Refund
        </span>
        <span className="text-sky-400 font-semibold">19 U.S.C. § 1313(j)(1)</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Customs Duties Paid */}
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
            Historical Duties Remitted
          </div>
          <div className="text-slate-300 text-[11px] leading-tight mb-1">
            Import Entry Summary 7501
          </div>
          <div className="text-slate-200 font-bold text-sm">
            $27,600.00
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Paid to U.S. Customs Treasury
          </div>
        </div>

        {/* Treasury Refund Check */}
        <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xs">
          <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 flex items-center justify-between">
            <span>Treasury Direct Cash Refund</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-slate-300 text-[11px] leading-tight mb-1">
            99% Lawful Statutory Drawback
          </div>
          <div className="text-emerald-400 font-bold text-sm">
            $27,324.00
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1">
            Direct Wire to Client Treasury
          </div>
        </div>
      </div>

      {/* The Unlock Stamp */}
      <div 
        onClick={() => sound.playLock()}
        className="mt-2.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/50 rounded-xs flex items-center justify-between cursor-pointer hover:bg-emerald-600/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>MATCH UNLOCKED: $27,324.00 RE-EXPORT DRAWBACK READY TO HARVEST</span>
        </div>
        <span className="text-[10px] text-emerald-400 uppercase font-semibold">Wire Ready</span>
      </div>
    </div>
  );
};
