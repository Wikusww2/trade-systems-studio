"use client";

import React from "react";
import { Shield, ArrowRight, Terminal, CheckCircle2, Mail, ExternalLink } from "lucide-react";

interface ArchitectThesisProps {
  onOpenBooking: () => void;
  onOpenAudit: () => void;
}

export const ArchitectThesis: React.FC<ArchitectThesisProps> = ({
  onOpenBooking,
  onOpenAudit,
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden my-4 bg-[#111622] border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Author Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">SAMUEL RENCKEN</span>
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[11px] text-emerald-400 font-semibold">Principal Trade Systems Architect</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Specializing in Autonomous Document Pipelines, Customs Compliance, and CargoWise eAdaptor Infrastructure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Available for $160k-$260k+ Senior Remote &amp; Systems Sprints
            </span>
          </div>
        </div>

        {/* First-Person Conversational Thesis */}
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans mb-8">
          <p className="text-sm font-semibold text-slate-100 font-mono">
            Why I Built Trade Systems Studio:
          </p>
          <p>
            When I started auditing cross-border commercial invoices and carrier freight bills, I noticed a dangerous pattern: logistics teams were plugging raw LLM wrappers directly into customs workflows.
          </p>
          <p>
            Raw language models guess. In customs compliance, a guess on an HTS Chapter 85 subheading or an omitted CIF marine insurance declaration does not save money; it triggers catastrophic 19 U.S.C. § 1592 civil penalties up to 4.0x lawful duty loss.
          </p>
          <p>
            I built Trade Systems Studio to prove a deterministic alternative: use spatial document vision (Docling) strictly to extract bounding box coordinates, and use deterministic Python rules engines to enforce 19 CFR valuation math, WCO GRI 1 to 6 classification hierarchies, and CargoWise UniversalShipment XML schemas.
          </p>
          <p className="text-slate-400 font-mono text-[11px]">
            Whether you want to deploy this pre-audit firewall in front of your CargoWise instance through a free 50-bill forensic diagnostic, or bring me in to architect autonomous trade systems for your engineering scale-up, you can test the exact production code right on this page.
          </p>
        </div>

        {/* Dual Track Conversion Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Next Step for Engineering Leaders &amp; Operators:
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              Evaluate our production kernel or run a blind diagnostic audit.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Book Architecture Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenAudit}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Audit 50 Historical Bills Free</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
