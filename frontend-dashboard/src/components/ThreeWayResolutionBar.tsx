"use client";

import React, { useState } from "react";
import { CheckCircle2, FileQuestion, ShieldAlert, RotateCcw, AlertTriangle } from "lucide-react";
import { usePreIngestFirewall, playPseudoHaptic } from "@/lib/firewall-core";
import { ResolutionActionType } from "@/lib/types";

interface ThreeWayResolutionBarProps {
  discrepancyId: string;
  confidence: number;
  statutoryCode: string;
  onResolved?: (action: ResolutionActionType) => void;
}

const REASON_CODES: Record<ResolutionActionType, string[]> = {
  approve_clean: [
    "CONFIRMED_SHIPPERS_CORRECTED_INVOICE",
    "VERIFIED_STATUTORY_TARIFF_EXCLUSION",
    "AUTHORIZED_INCOTERMS_CIF_PORT_APPRAISAL",
    "DE_MINIMIS_STATUTORY_TOLERANCE_SATISFIED",
  ],
  request_paperwork: [
    "MISSING_CARRIER_ORIGINAL_OCEAN_BL",
    "UNPROVIDED_TOOLING_ASSIST_PURCHASE_ORDER",
    "OMITTED_DESTINATION_INLAND_INSURANCE_CERTIFICATE",
    "DISCORDANT_CHASSIS_SPLIT_WORK_ORDER",
  ],
  escalate_broker: [
    "POTENTIAL_19_USC_1592_GROSS_NEGLIGENCE_EXPOSURE",
    "OFAC_50_PERCENT_BENEFICIAL_OWNERSHIP_REVIEW",
    "CONTESTED_WCO_GRI_ESSENTIAL_CHARACTER_DISPUTE",
    "PRIOR_DISCLOSURE_PETITION_REQUIRED_19_CFR_162_74",
  ],
};

export const ThreeWayResolutionBar: React.FC<ThreeWayResolutionBarProps> = ({
  discrepancyId,
  confidence,
  statutoryCode,
  onResolved,
}) => {
  const { resolutionHistory, applyResolution, undoResolution } = usePreIngestFirewall();
  const existingResolution = resolutionHistory[discrepancyId];

  const [activeAction, setActiveAction] = useState<ResolutionActionType | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");

  const handleActionSelect = (action: ResolutionActionType) => {
    playPseudoHaptic();
    setActiveAction(action);
    setSelectedReason(REASON_CODES[action][0]);
  };

  const handleConfirm = () => {
    if (!activeAction || !selectedReason) return;
    playPseudoHaptic();
    applyResolution(discrepancyId, activeAction, selectedReason);
    if (onResolved) onResolved(activeAction);
    setActiveAction(null);
  };

  const handleCancel = () => {
    playPseudoHaptic();
    setActiveAction(null);
  };

  if (existingResolution) {
    const actionLabel =
      existingResolution.action === "approve_clean"
        ? "APPROVED & PUSHED TO XML"
        : existingResolution.action === "request_paperwork"
        ? "SHIPPER PAPERWORK REQUESTED"
        : "ESCALATED TO LICENSED COUNSEL";

    const badgeColor =
      existingResolution.action === "approve_clean"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        : existingResolution.action === "request_paperwork"
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
        : "bg-red-500/10 border-red-500/30 text-red-400";

    return (
      <div className="mt-3 p-2.5 rounded-lg border border-[#1F2937] bg-[#0F172A] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
            {actionLabel}
          </span>
          <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
            {existingResolution.reason_code}
          </span>
        </div>
        <button
          onClick={() => {
            playPseudoHaptic();
            undoResolution(discrepancyId);
          }}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1"
          title="Revert resolution"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg border border-[#1F2937] bg-[#0B0F19]/90 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            HOTL Gate • Conf(e) = {(confidence * 100).toFixed(1)}% • {statutoryCode}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          EU AI Act Art. 26
        </span>
      </div>

      {!activeAction ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleActionSelect("approve_clean")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve XML</span>
          </button>

          <button
            onClick={() => handleActionSelect("request_paperwork")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition-all active:scale-[0.98]"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Request Docs</span>
          </button>

          <button
            onClick={() => handleActionSelect("escalate_broker")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono transition-all active:scale-[0.98]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalate</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-1 border-t border-[#1F2937]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-300">
              Select Statutory Reason Code:
            </span>
            <button
              onClick={handleCancel}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <select
            aria-label="Statutory Reason Code"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full text-xs font-mono bg-[#0F172A] border border-[#1F2937] rounded p-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {REASON_CODES[activeAction].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <button
            onClick={handleConfirm}
            className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-canvas-stone font-mono text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
          >
            Confirm & Log to AuditRunProvenance
          </button>
        </div>
      )}
    </div>
  );
};
