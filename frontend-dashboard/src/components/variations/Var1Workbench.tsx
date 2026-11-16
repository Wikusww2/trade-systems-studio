"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePreIngestFirewall } from "@/lib/firewall-core";
import { ThreeWayResolutionBar } from "../ThreeWayResolutionBar";
import { DiscrepancyCard } from "../DiscrepancyCard";
import { CargoWiseXmlViewer } from "../CargoWiseXmlViewer";
import { DeveloperApiSandbox } from "../DeveloperApiSandbox";
import { SanctionsGraphViewer } from "../SanctionsGraphViewer";
import { HtsClassifierViewer } from "../HtsClassifierViewer";
import { CustomsValuationViewer } from "../CustomsValuationViewer";
import { ScenarioSelectorBar, CORRIDOR_SCENARIOS, Scenario } from "../ScenarioSelectorBar";
import { RollingNumber } from "../RollingNumber";
import { ProvenanceMetadataBar } from "../ProvenanceCockpit";
import { resolveAssetPath } from "@/lib/assets";
import { sound } from "@/lib/audio";
import {
  Scale,
  DollarSign,
  FileCheck2,
  Network,
  Binary,
  Landmark,
  Download,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Columns2,
  FileText,
  LayoutList,
  CheckCircle2,
  Terminal,
  Code2,
  Eye,
  EyeOff,
} from "lucide-react";

const PdfOverlayCanvas = dynamic(
  () => import("../PdfOverlayCanvas").then((mod) => mod.PdfOverlayCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-[#0B0F19] border border-[#1F2937] text-slate-400 font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
        <span>Initializing High-Precision Document Lens...</span>
      </div>
    ),
  }
);

const ALL_PILLARS = [
  {
    id: "concept_1_customs",
    name: "01 / Customs Valuation & 1592 Defense",
    shortTag: "CUSTOMS FIREWALL",
    icon: <Scale className="w-3.5 h-3.5" />,
    statute: "19 U.S.C. § 1592 & 19 CFR § 152.103",
  },
  {
    id: "concept_2_freight",
    name: "02 / Pre-Payment Freight Overbilling",
    shortTag: "FREIGHT AUDIT",
    icon: <DollarSign className="w-3.5 h-3.5" />,
    statute: "FMC Docket 21-08 & OSRA 2022",
  },
  {
    id: "concept_3_drawback",
    name: "03 / Section 1313 Duty Drawback",
    shortTag: "DUTY DRAWBACK",
    icon: <FileCheck2 className="w-3.5 h-3.5" />,
    statute: "19 U.S.C. § 1313 Unused Merchandise",
  },
  {
    id: "concept_4_sanctions",
    name: "04 / Sanctions & Entity Graph",
    shortTag: "OFAC 50% GRAPH",
    icon: <Network className="w-3.5 h-3.5" />,
    statute: "31 CFR § 501 / OFAC 50% Rule",
  },
  {
    id: "concept_5_hts",
    name: "05 / HTS Classification Copilot",
    shortTag: "GRI 1-6 COPILOT",
    icon: <Binary className="w-3.5 h-3.5" />,
    statute: "WCO GRI 1 to 6 & 19 CFR § 24.23",
  },
  {
    id: "concept_6_valuation",
    name: "06 / CBP Assist & Valuation Register",
    shortTag: "152.103 ASSISTS",
    icon: <Landmark className="w-3.5 h-3.5" />,
    statute: "19 CFR § 152.103 & 19 CFR § 162.74",
  },
];

interface Var1WorkbenchProps {
  onOpenLeadModal?: () => void;
}

export const Var1Workbench: React.FC<Var1WorkbenchProps> = ({ onOpenLeadModal }) => {
  const {
    auditData,
    isLoading,
    activeConceptId,
    activeDiscrepancyId,
    quarantineState,
    piiRedactionActive,
    switchConcept,
    selectDiscrepancy,
    togglePiiRedaction,
    exportAuditPacket,
  } = usePreIngestFirewall();

  const [rightTerminalTab, setRightTerminalTab] = useState<"discrepancies" | "cargowise" | "developer_api">("discrepancies");
  const [mobileTab, setMobileTab] = useState<"findings" | "doc">("doc");
  const [desktopViewMode, setDesktopViewMode] = useState<"split" | "doc_focus" | "report_focus">("split");

  const handleCardClick = (id: string) => {
    selectDiscrepancy(id);
  };

  const handleBboxClick = (id: string) => {
    selectDiscrepancy(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileTab("findings");
    } else if (desktopViewMode === "doc_focus") {
      setDesktopViewMode("split");
    }
    const cardEl = document.getElementById(`card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const displayedExposureAvoided = auditData?.metrics?.penalty_exposure_avoided || 125000;
  const displayedCarrierOverbilling = auditData?.metrics?.carrier_overbilling_caught || 1547.5;
  const displayedDrawback = auditData?.metrics?.drawback_unclaimed_unlocked || 27324;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. SCENARIO SELECTOR */}
      <ScenarioSelectorBar
        activeScenarioId={CORRIDOR_SCENARIOS.find((s) => s.concept_id === activeConceptId)?.id || "scenario_durban_rotterdam"}
        onSelectScenario={(sc: Scenario) => switchConcept(sc.concept_id)}
      />

      {/* 2. SWISS HYBRID CONTROLS & QUARANTINE STATUS BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F172A] border border-[#1F2937] shadow-xl">
        {/* Left: 6 Pillars Workspace Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 lg:pb-0 scrollbar-thin">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0 mr-1">
            PILLARS:
          </span>
          {ALL_PILLARS.map((pillar) => {
            const isActive = activeConceptId === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => switchConcept(pillar.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#1E293B] border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                    : "bg-[#0B0F19] border-[#1F2937] text-slate-400 hover:text-slate-200"
                }`}
              >
                {pillar.icon}
                <span>{pillar.shortTag}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quarantine State + Export Board & Counsel Packet */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Quarantine Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-semibold ${
              quarantineState === "QUARANTINED"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {quarantineState === "QUARANTINED" ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{quarantineState}</span>
          </div>

          {/* Client-Side PII Scrubbing Toggle */}
          <button
            onClick={togglePiiRedaction}
            title="Scrub EIN, Tax ID, and Consignee account numbers from UI"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
              piiRedactionActive
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-[#0B0F19] border-[#1F2937] text-slate-400 hover:text-slate-200"
            }`}
          >
            {piiRedactionActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{piiRedactionActive ? "PII Scrubbed" : "PII Visible"}</span>
          </button>

          {/* Export Board & Counsel Audit Packet Button */}
          <button
            onClick={() => exportAuditPacket()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Board & Counsel Audit Packet</span>
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC KILL-SHOT METRICS FLASH CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-xl shadow-lg">
          <div className="text-[9px] uppercase text-slate-400 font-semibold tracking-wider">
            19 U.S.C. § 1592 Exposure Avoided
          </div>
          <div className="text-base sm:text-xl font-bold text-red-400 tabular-nums">
            <RollingNumber value={displayedExposureAvoided} />
          </div>
          <div className="text-[10px] text-slate-500">Statutory safe-harbor mitigation</div>
        </div>

        <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-xl shadow-lg">
          <div className="text-[9px] uppercase text-slate-400 font-semibold tracking-wider">
            Pre-Payment Freight Overbilling Intercepted
          </div>
          <div className="text-base sm:text-xl font-bold text-red-400 tabular-nums">
            <RollingNumber value={displayedCarrierOverbilling} />
          </div>
          <div className="text-[10px] text-slate-500">Withheld prior to cash disbursement</div>
        </div>

        <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-xl shadow-lg">
          <div className="text-[9px] uppercase text-slate-400 font-semibold tracking-wider">
            99% Duty Drawback Cash Unlocked
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-400 tabular-nums">
            <RollingNumber value={displayedDrawback} />
          </div>
          <div className="text-[10px] text-slate-500">19 U.S.C. § 1313 direct cash refund</div>
        </div>
      </div>

      {/* 4. PROVENANCE COCKPIT STRIP */}
      <ProvenanceMetadataBar audit={auditData} />

      {/* 5. WORKBENCH MAIN DISPLAY */}
      {activeConceptId === "concept_4_sanctions" ? (
        <SanctionsGraphViewer onOpenLeadModal={onOpenLeadModal} />
      ) : activeConceptId === "concept_5_hts" ? (
        <div className="h-[750px] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <HtsClassifierViewer onLeadTrigger={onOpenLeadModal} />
        </div>
      ) : activeConceptId === "concept_6_valuation" ? (
        <div className="h-[750px] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <CustomsValuationViewer onLeadTrigger={onOpenLeadModal} />
        </div>
      ) : (
        <div className="h-[750px] flex flex-col lg:flex-row border border-[#1F2937] rounded-xl overflow-hidden bg-[#0B0F19] shadow-2xl">
          {/* LEFT PANE: Canvas PDF Viewer */}
          <div
            className={`h-full border-b lg:border-b-0 lg:border-r border-[#1F2937] flex-col overflow-hidden transition-all duration-200 ${
              mobileTab === "doc" ? "flex w-full" : "hidden lg:flex"
            } ${
              desktopViewMode === "doc_focus"
                ? "lg:w-full lg:flex"
                : desktopViewMode === "report_focus"
                ? "lg:hidden"
                : "lg:w-3/5"
            }`}
          >
            {auditData && (
              <PdfOverlayCanvas
                documentUrl={auditData.document_url}
                discrepancies={auditData.discrepancies}
                activeDiscrepancyId={activeDiscrepancyId}
                onClickDiscrepancy={handleBboxClick}
                onHoverDiscrepancy={selectDiscrepancy}
                filename={auditData.document_filename}
              />
            )}
          </div>

          {/* RIGHT PANE: Forensic Report & Resolution Desk */}
          <div
            className={`h-full flex-col bg-[#0F172A] overflow-hidden ${
              mobileTab === "findings" ? "flex w-full" : "hidden lg:flex"
            } ${
              desktopViewMode === "report_focus"
                ? "lg:w-full"
                : desktopViewMode === "doc_focus"
                ? "lg:hidden"
                : "lg:w-2/5"
            }`}
          >
            {/* Terminal Header & Sub-Tabs */}
            <div className="px-4 py-3 border-b border-[#1F2937] flex items-center justify-between bg-[#0B0F19] shrink-0 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    sound.playTick();
                    setRightTerminalTab("discrepancies");
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    rightTerminalTab === "discrepancies"
                      ? "bg-[#1E293B] text-white border border-slate-700 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Findings ({auditData?.discrepancies.length || 0})</span>
                </button>
                <button
                  onClick={() => {
                    sound.playLock();
                    setRightTerminalTab("cargowise");
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    rightTerminalTab === "cargowise"
                      ? "bg-[#1E293B] text-white border border-slate-700 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CargoWise XML</span>
                </button>
                <button
                  onClick={() => {
                    sound.playLock();
                    setRightTerminalTab("developer_api");
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    rightTerminalTab === "developer_api"
                      ? "bg-[#1E293B] text-white border border-slate-700 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cobalt-400" />
                  <span>API Sandbox</span>
                </button>
              </div>

              {/* Desktop Layout Mode Switcher */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => {
                    sound.playTick();
                    setDesktopViewMode(desktopViewMode === "split" ? "report_focus" : "split");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded"
                  title="Toggle Report Focus"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Findings List with Mounted ThreeWayResolutionBar */}
            {rightTerminalTab === "discrepancies" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500 font-mono text-xs gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                    <span>Executing Statutory Kernel...</span>
                  </div>
                ) : auditData?.discrepancies.length === 0 ? (
                  <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Clean Invoice Verified for UniversalInterchange XML</span>
                    </div>
                    <p className="text-slate-300">
                      Zero statutory discrepancy detected. Clean FOB contract verified with lawful entry base.
                    </p>
                  </div>
                ) : (
                  auditData?.discrepancies.map((disc) => {
                    const shouldMountResolutionBar = disc.confidence < 0.85 || disc.severity === "critical";
                    return (
                      <div key={disc.id} className="space-y-2">
                        <DiscrepancyCard
                          discrepancy={disc}
                          isActive={activeDiscrepancyId === disc.id}
                          onHover={selectDiscrepancy}
                          onClick={handleCardClick}
                          onFocusMobileDoc={() => {
                            selectDiscrepancy(disc.id);
                            setMobileTab("doc");
                          }}
                        />
                        {shouldMountResolutionBar && (
                          <div className="pl-2 border-l-2 border-amber-500/60">
                            <ThreeWayResolutionBar
                              discrepancyId={disc.id}
                              confidence={disc.confidence}
                              statutoryCode={disc.statutory_code}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* CargoWise XML Tab */}
            {rightTerminalTab === "cargowise" && (
              <div className="flex-1 overflow-y-auto p-4">
                <CargoWiseXmlViewer />
              </div>
            )}

            {/* Developer API Tab */}
            {rightTerminalTab === "developer_api" && (
              <div className="flex-1 overflow-y-auto p-4">
                <DeveloperApiSandbox />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
