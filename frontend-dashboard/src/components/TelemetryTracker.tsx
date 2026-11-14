"use client";

import React, { useState } from "react";
import { recordTelemetry } from "@/lib/supabase";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { ShieldAlert, ArrowRight, Activity } from "lucide-react";

interface TelemetryTrackerProps {
  activeConceptId: string;
}

export const TelemetryTracker: React.FC<TelemetryTrackerProps> = ({
  activeConceptId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    recordTelemetry({
      event_type: "conversion_bar_click",
      concept_id: activeConceptId,
      metadata: { location: "bottom_conversion_bar" },
    });
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Bottom Conversion Bar */}
      <aside aria-label="Enterprise Audit Diagnostic Offer" className="w-full bg-[#0F172A] border-t border-[#1F2937] px-6 py-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-100">
                ENTERPRISE AUDIT DIAGNOSTIC
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800">
                100% CONTINGENT
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Run a blind diagnostic audit on 25 of your own historical invoices: <strong className="text-white">$0 upfront</strong>, funded purely on recovered cash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Deterministic Math Guard Active</span>
          </div>

          <button
            onClick={handleOpenModal}
            className="w-full md:w-auto px-5 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 border border-red-500 shadow-lg shadow-red-950/20"
          >
            <span>Claim Free 25-Invoice Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Conversion Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeConceptId={activeConceptId}
      />
    </>
  );
};
