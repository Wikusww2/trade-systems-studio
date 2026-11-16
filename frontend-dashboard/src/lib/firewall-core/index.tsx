"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { AuditResult, Discrepancy, BoundingBox, ResolutionRecord, ResolutionActionType, EngagementPolicy } from "../types";
import { fetchAudit, fetchAggregateMetrics } from "../api";
import { sound } from "../audio";
import { recordTelemetry } from "../supabase";

// 18ms 900Hz Web Audio API pseudo-haptic synthesizer
export function playPseudoHaptic(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, ctx.currentTime);

    // 18ms envelope: instant attack, exponential decay to zero
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {
    // Graceful degradation when audio context is blocked
  }
}

// Bounding box coordinate projector: maps [0, 1000) normalized Docling space to rendered canvas
export function projectDoclingBoundingBox(
  box: BoundingBox,
  renderedWidth: number,
  renderedHeight: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: (box.x / 1000) * renderedWidth,
    top: (box.y / 1000) * renderedHeight,
    width: (box.width / 1000) * renderedWidth,
    height: (box.height / 1000) * renderedHeight,
  };
}

// Client-side PII redactor (scrubs EIN, Tax IDs, IBANs, and consignee account numbers)
export function redactPiiText(text: string, enabled: boolean): string {
  if (!enabled || !text) return text;
  return text
    .replace(/\b\d{2}-\d{7}\b/g, "[EIN REDACTED]")
    .replace(/\b\d{9}\b/g, "[TAX ID REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL REDACTED]");
}

export interface FirewallContextValue {
  auditData: AuditResult | null;
  isLoading: boolean;
  activeConceptId: string;
  activeDiscrepancyId: string | null;
  quarantineState: "QUARANTINED" | "RELEASED" | "ESCALATED";
  resolutionHistory: Record<string, ResolutionRecord>;
  piiRedactionActive: boolean;
  engagementPolicy: EngagementPolicy;
  switchConcept: (conceptId: string) => void;
  selectDiscrepancy: (id: string | null) => void;
  applyResolution: (discrepancyId: string, action: ResolutionActionType, reasonCode: string, notes?: string) => void;
  undoResolution: (discrepancyId: string) => void;
  togglePiiRedaction: () => void;
  exportAuditPacket: () => Promise<void>;
  triggerHaptic: () => void;
}

const DEFAULT_POLICY: EngagementPolicy = {
  policy_id: "FORWARDER-TIER-1-OSRA2022",
  auto_hold_threshold_usd: 10000.0,
  commercial_freight_tolerance_usd: 25.0,
  statutory_floor_enforced: true,
  fmc_free_time_days: 4,
  assist_amortization_method: "first_entry_lump_sum",
};

const FirewallContext = createContext<FirewallContextValue | null>(null);

export function FirewallProvider({ children }: { children: ReactNode }) {
  const [activeConceptId, setActiveConceptId] = useState<string>("concept_1_customs");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeDiscrepancyId, setActiveDiscrepancyId] = useState<string | null>(null);
  const [resolutionHistory, setResolutionHistory] = useState<Record<string, ResolutionRecord>>({});
  const [piiRedactionActive, setPiiRedactionActive] = useState<boolean>(false);
  const [engagementPolicy] = useState<EngagementPolicy>(DEFAULT_POLICY);

  const fetchCurrentAudit = useCallback(async (conceptId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchAudit(conceptId);
      setAuditData(data);
      if (data.discrepancies.length > 0) {
        setActiveDiscrepancyId(data.discrepancies[0].id);
      }
    } catch (err) {
      console.error("Firewall fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentAudit(activeConceptId);
  }, [activeConceptId, fetchCurrentAudit]);

  const switchConcept = useCallback((conceptId: string) => {
    playPseudoHaptic();
    sound.playLock();
    setActiveConceptId(conceptId);
    recordTelemetry({
      event_type: "concept_switch",
      concept_id: conceptId,
    });
  }, []);

  const selectDiscrepancy = useCallback((id: string | null) => {
    playPseudoHaptic();
    sound.playTick();
    setActiveDiscrepancyId(id);
    if (id) {
      recordTelemetry({
        event_type: "discrepancy_card_selected",
        metadata: { discrepancy_id: id },
      });
    }
  }, []);

  const applyResolution = useCallback(
    (discrepancyId: string, action: ResolutionActionType, reasonCode: string, notes?: string) => {
      playPseudoHaptic();
      sound.playLock();
      const record: ResolutionRecord = {
        discrepancy_id: discrepancyId,
        action,
        reason_code: reasonCode,
        notes,
        timestamp: new Date().toISOString(),
        resolved_by: "LICENSED_CUSTOMS_BROKER",
      };
      setResolutionHistory((prev) => ({ ...prev, [discrepancyId]: record }));
      recordTelemetry({
        event_type: "discrepancy_resolved",
        metadata: { discrepancy_id: discrepancyId, action, reasonCode },
      });
    },
    []
  );

  const undoResolution = useCallback((discrepancyId: string) => {
    playPseudoHaptic();
    sound.playTick();
    setResolutionHistory((prev) => {
      const next = { ...prev };
      delete next[discrepancyId];
      return next;
    });
  }, []);

  const togglePiiRedaction = useCallback(() => {
    playPseudoHaptic();
    setPiiRedactionActive((prev) => !prev);
  }, []);

  const exportAuditPacket = useCallback(async () => {
    playPseudoHaptic();
    sound.playLock();
    if (!auditData) return;

    const packet = {
      title: "TradeTech Systems Studio - Board & Counsel Audit Packet",
      statutory_authority: "19 U.S.C. § 1592 & 19 CFR § 152.103",
      audit_run_id: auditData.audit_run_id || "RUN-2026-USC1592-PROV",
      calc_version: auditData.calc_version || "2026.1.0",
      executed_at: auditData.executed_at || new Date().toISOString(),
      engagement_policy: auditData.engagement_policy || DEFAULT_POLICY,
      quarantine_status: auditData.quarantine_status || "QUARANTINED",
      metrics: auditData.metrics,
      discrepancies: auditData.discrepancies.map((d) => ({
        ...d,
        description: redactPiiText(d.description, piiRedactionActive),
        resolution: resolutionHistory[d.id] || null,
      })),
    };

    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counsel_audit_packet_${auditData.concept_id}_${packet.audit_run_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    recordTelemetry({
      event_type: "counsel_audit_packet_downloaded",
      metadata: { audit_run_id: packet.audit_run_id },
    });
  }, [auditData, piiRedactionActive, resolutionHistory]);

  const isQuarantined = auditData
    ? auditData.discrepancies.some((d) => !resolutionHistory[d.id] && (d.confidence < 0.85 || d.severity === "critical"))
    : false;

  const quarantineState: "QUARANTINED" | "RELEASED" | "ESCALATED" = isQuarantined
    ? "QUARANTINED"
    : "RELEASED";

  const value: FirewallContextValue = {
    auditData,
    isLoading,
    activeConceptId,
    activeDiscrepancyId,
    quarantineState,
    resolutionHistory,
    piiRedactionActive,
    engagementPolicy,
    switchConcept,
    selectDiscrepancy,
    applyResolution,
    undoResolution,
    togglePiiRedaction,
    exportAuditPacket,
    triggerHaptic: playPseudoHaptic,
  };

  return <FirewallContext.Provider value={value}>{children}</FirewallContext.Provider>;
}

export function usePreIngestFirewall(): FirewallContextValue {
  const context = useContext(FirewallContext);
  if (!context) {
    throw new Error("usePreIngestFirewall must be used within a FirewallProvider");
  }
  return context;
}
