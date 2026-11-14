"use client";

import React, { useState, useEffect, useRef } from "react";
import { AuditResult, KillShotMetrics } from "@/lib/types";
import { fetchAudit, fetchAggregateMetrics } from "@/lib/api";
import dynamic from "next/dynamic";
import { DiscrepancyCard } from "./DiscrepancyCard";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { RoiCalculator } from "./RoiCalculator";
import { ExecutiveServices } from "./ExecutiveServices";
import { BilledVsLawfulDiff } from "./BilledVsLawfulDiff";
import { PenaltyExposureLadder } from "./PenaltyExposureLadder";
import { DifferentialistMatrix } from "./DifferentialistMatrix";
import { ExecutiveDossierModal } from "./ExecutiveDossierModal";
import { AmbientMotionBackground } from "./AmbientMotionBackground";
import { FilmTheaterModal } from "./FilmTheaterModal";
import { RollingNumber } from "./RollingNumber";
import { FunnelRedesignStudio } from "./funnel-variations/FunnelRedesignStudio";
import { SanctionsGraphViewer } from "./SanctionsGraphViewer";
import { HtsClassifierViewer } from "./HtsClassifierViewer";
import { CustomsValuationViewer } from "./CustomsValuationViewer";
import { SystemArchitectureModal } from "./SystemArchitectureModal";
import { ExecutiveTourOverlay } from "./ExecutiveTourOverlay";
import { CargoWiseXmlViewer } from "./CargoWiseXmlViewer";
import { DeveloperApiSandbox } from "./DeveloperApiSandbox";
import { ScenarioSelectorBar, CORRIDOR_SCENARIOS, Scenario } from "./ScenarioSelectorBar";
import { InlineArchitectureFlow } from "./InlineArchitectureFlow";
import { ArchitectThesis } from "./ArchitectThesis";
import { sound } from "@/lib/audio";
import { recordTelemetry } from "@/lib/supabase";
import { resolveAssetPath } from "@/lib/assets";
import { auditUploadedPdf } from "@/lib/clientAuditor";
import {
  Scale,
  DollarSign,
  FileCheck2,
  Cpu,
  Shield,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  AlertOctagon,
  Printer,
  Sparkles,
  Network,
  Binary,
  Landmark,
  Upload,
  Code2,
  Terminal,
  Zap,
} from "lucide-react";

const PdfOverlayCanvas = dynamic(
  () => import("./PdfOverlayCanvas").then((mod) => mod.PdfOverlayCanvas),
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

export const DualPaneAuditViewer: React.FC = () => {
  const [activeConceptId, setActiveConceptId] = useState<string>("concept_1_customs");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [aggregateMetrics, setAggregateMetrics] = useState<KillShotMetrics | null>(null);
  const [activeDiscrepancyId, setActiveDiscrepancyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Right-hand terminal tab state
  const [rightTerminalTab, setRightTerminalTab] = useState<"discrepancies" | "cargowise" | "developer_api">("discrepancies");

  // Disruption Mode Chaos State
  const [disruptionMode, setDisruptionMode] = useState<boolean>(false);
  const [disruptionVector, setDisruptionVector] = useState<"port_congestion" | "fuel_spike" | "red_sea">("port_congestion");

  // Modals & Guided Experience
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isFilmOpen, setIsFilmOpen] = useState<boolean>(false);
  const [selectedServiceTier, setSelectedServiceTier] = useState<string>("contingent_audit");
  const [isFunnelStudioOpen, setIsFunnelStudioOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [architectureModalTab, setArchitectureModalTab] = useState<"architecture" | "tests" | "math_proof" | "candidate" | "playground" | "screener">("architecture");
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Mobile segmented view state ('doc' | 'findings')
  const [mobileTab, setMobileTab] = useState<"findings" | "doc">("findings");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Theme state: default to 'dark' for Nightmare Suite terminal aesthetic, with toggle
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playLock();
    setIsLoading(true);
    try {
      const result = await auditUploadedPdf(file);
      setAuditData(result);
      setActiveConceptId("client_upload_audit");
      setActiveDiscrepancyId(result.discrepancies[0]?.id || null);
      recordTelemetry({
        event_type: "client_pdf_upload_audited",
        metadata: {
          filename: file.name,
          size: file.size,
          discrepancies_count: result.discrepancies.length,
        },
      });
    } catch (err) {
      console.error("Client PDF audit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchConcept = (conceptId: string) => {
    sound.playLock();
    setActiveConceptId(conceptId);
    if (typeof window !== "undefined") {
      const slugMap: Record<string, string> = {
        concept_1_customs: "customs",
        concept_2_freight: "freight",
        concept_3_drawback: "drawback",
        concept_4_sanctions: "sanctions",
        concept_5_hts: "hts",
        concept_6_valuation: "valuation",
        concept_clean_fob: "clean_fob",
        client_upload_audit: "upload",
      };
      const slug = slugMap[conceptId] || conceptId;
      window.history.replaceState(null, "", `#${slug}`);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = saved || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || hash;

      if (tabParam === "sanctions" || tabParam === "concept_4_sanctions") {
        setActiveConceptId("concept_4_sanctions");
      } else if (tabParam === "hts" || tabParam === "concept_5_hts") {
        setActiveConceptId("concept_5_hts");
      } else if (tabParam === "valuation" || tabParam === "concept_6_valuation") {
        setActiveConceptId("concept_6_valuation");
      } else if (tabParam === "freight" || tabParam === "concept_2_freight") {
        setActiveConceptId("concept_2_freight");
      } else if (tabParam === "drawback" || tabParam === "concept_3_drawback") {
        setActiveConceptId("concept_3_drawback");
      } else if (tabParam === "clean_fob" || tabParam === "concept_clean_fob") {
        setActiveConceptId("concept_clean_fob");
      } else if (tabParam === "architecture" || tabParam === "tests" || tabParam === "screener" || tabParam === "pitch" || tabParam === "playground" || tabParam === "api") {
        if (tabParam === "tests") {
          setArchitectureModalTab("tests");
        } else if (tabParam === "screener" || tabParam === "pitch") {
          setArchitectureModalTab("screener");
        } else if (tabParam === "playground" || tabParam === "api") {
          setArchitectureModalTab("playground");
        } else {
          setArchitectureModalTab("architecture");
        }
        setIsArchitectureModalOpen(true);
      } else if (tabParam === "dossier") {
        setIsDossierOpen(true);
      } else if (tabParam === "film" || tabParam === "keynote") {
        setIsFilmOpen(true);
      } else if (tabParam === "tour" || tabParam === "walkthrough") {
        setIsTourActive(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    sound.playTick();
  };

  useEffect(() => {
    let isMounted = true;
    if (activeConceptId === "client_upload_audit") {
      return;
    }
    setIsLoading(true);

    Promise.all([fetchAudit(activeConceptId), fetchAggregateMetrics()]).then(
      ([auditRes, metricsRes]) => {
        if (!isMounted) return;
        setAuditData(auditRes);
        setAggregateMetrics(metricsRes);
        setIsLoading(false);
      }
    );

    recordTelemetry({
      event_type: "concept_switch",
      concept_id: activeConceptId,
    });

    return () => {
      isMounted = false;
    };
  }, [activeConceptId]);

  const handleCardClick = (id: string) => {
    setActiveDiscrepancyId(id);
    sound.playTick();
    recordTelemetry({
      event_type: "discrepancy_card_selected",
      concept_id: activeConceptId,
      metadata: { discrepancy_id: id },
    });
  };

  const handleBboxClick = (id: string) => {
    setActiveDiscrepancyId(id);
    sound.playLock();
    const cardEl = document.getElementById(`card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const openConsultation = (tier: string = "contingent_audit") => {
    sound.playLock();
    setSelectedServiceTier(tier);
    setIsModalOpen(true);
    setIsMobileNavOpen(false);
  };

  // Disruption mode metrics calculation
  const displayedExposureAvoided = disruptionMode
    ? (aggregateMetrics?.penalty_exposure_avoided || 125000) * 1.8
    : aggregateMetrics?.penalty_exposure_avoided || 125000;

  const displayedCarrierOverbilling = disruptionMode
    ? disruptionVector === "port_congestion"
      ? 15797.50
      : disruptionVector === "fuel_spike"
      ? 8387.50
      : 11147.50
    : aggregateMetrics?.carrier_overbilling_caught || 1547.50;

  const displayedDrawback = disruptionMode
    ? (aggregateMetrics?.drawback_unclaimed_unlocked || 27324) * 1.25
    : aggregateMetrics?.drawback_unclaimed_unlocked || 27324;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0F19] text-slate-100 flex flex-col font-sans transition-colors duration-200 relative selection:bg-blue-600 selection:text-white">
      {/* Subtle Static Dot Grid Background */}
      <AmbientMotionBackground />

      {/* 1. STICKY MINIMALIST DEVELOPER HEADER (56px) */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#1F2937] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Identity & Practice */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-md shadow-blue-500/20 shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase truncate">
                  SAMUEL
                </span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">·</span>
                <span className="font-mono text-[10px] tracking-wider text-blue-400 uppercase font-semibold truncate hidden sm:inline">
                  TRADE SYSTEMS STUDIO
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">
                  Available for Principal Systems & Forward-Deployed AI
                </span>
              </div>
            </div>
          </div>

          {/* Clean 4-Link Navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-mono text-slate-400">
            <a href="#workbench" className="hover:text-blue-400 transition-colors">
              #workbench
            </a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">
              #architecture
            </a>
            <a href="#value-pack-roi" className="hover:text-blue-400 transition-colors">
              #value-pack-roi
            </a>
            <a href="#architect-thesis" className="hover:text-blue-400 transition-colors">
              #architect-thesis
            </a>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => openConsultation("contingent_audit")}
              className="hidden md:inline-flex px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
            >
              50-Bill Audit ($0)
            </button>

            <button
              onClick={() => openConsultation("fractional_advisory")}
              className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all rounded-md shadow-md shadow-blue-500/20"
            >
              <span className="hidden sm:inline">Book Architecture Review</span>
              <span className="sm:hidden">Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className="p-1.5 text-slate-400 hover:text-white bg-[#0F172A] border border-[#1F2937] rounded-md transition-all shrink-0"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="xl:hidden p-1.5 text-slate-300 border border-slate-700 rounded-md shrink-0"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="lg:hidden pt-3 pb-2 mt-2 border-t border-[#1F2937] space-y-2 font-mono text-xs">
            <a
              href="#workbench"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-300 hover:bg-slate-800 rounded-md"
            >
              #workbench
            </a>
            <a
              href="#architecture"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-300 hover:bg-slate-800 rounded-md"
            >
              #architecture
            </a>
            <a
              href="#value-pack-roi"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-300 hover:bg-slate-800 rounded-md"
            >
              #value-pack-roi
            </a>
            <a
              href="#architect-thesis"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-300 hover:bg-slate-800 rounded-md"
            >
              #architect-thesis
            </a>
            <button
              onClick={() => openConsultation("fractional_advisory")}
              className="w-full mt-2 py-2 px-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-md text-center"
            >
              Book Architecture Review
            </button>
          </div>
        )}
      </header>

      {/* 2. ACT 1: ABOVE-THE-FOLD SYSTEMS HERO */}
      <section className="border-b border-[#1F2937] bg-[#0F172A]/40 py-8 lg:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Systems Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 rounded-md font-semibold">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Deterministic Pre-Ingest Firewall</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1E293B] border border-[#1F2937] text-slate-300 rounded-md">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>CargoWise UniversalShipment XML & ACE Ready</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1E293B] border border-[#1F2937] text-slate-300 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>43/43 Automated Tests Passing</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
              Deterministic Pre-Ingest Verification for{" "}
              <span className="text-blue-400">CargoWise & ACE</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 font-normal">
              Intercepting 19 U.S.C. § 1592 customs penalties, carrier accessorial overbilling, and GRI misclassifications before UniversalShipment XML enters your TMS. Built with sub-50ms execution, zero floating-point drift, and 100% Python Decimal precision.
            </p>

            {/* Systems Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1F2937]">
              <div className="p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Execution Latency
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-blue-400 tabular-nums">
                  &lt; 38 ms
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Deterministic Gateway</div>
              </div>

              <div className="p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Arithmetic Standard
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 tabular-nums">
                  100% Decimal
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Zero LLM Calculations</div>
              </div>

              <div className="p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Carrier Leakage Intercept
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-rose-400 tabular-nums">
                  3% to 7.5%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Pre-Payment Guard</div>
              </div>

              <div className="p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Value Pack Rework
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-amber-400 tabular-nums">
                  0 Failed Retries
                </div>
                <div className="text-[10px] text-slate-500 font-mono">eAdaptor Pre-Clearance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-PANE AUDIT WORKBENCH (ACT 1 CONTINUED) */}
      <section id="workbench" className="max-w-7xl w-full max-w-full overflow-hidden mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Scenario Bar: Durban, Long Beach, Steel Drawback */}
        <ScenarioSelectorBar
          activeScenarioId={CORRIDOR_SCENARIOS.find((s) => s.concept_id === activeConceptId)?.id || "scenario_durban_rotterdam"}
          onSelectScenario={(sc: Scenario) => switchConcept(sc.concept_id)}
        />

        {/* Pillar Switcher Ribbon: 6 Core Engineering Pillars */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1F2937] overflow-x-auto max-w-full font-mono text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">
            System Pillars:
          </span>
          {ALL_PILLARS.map((pillar) => {
            const isActive = activeConceptId === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => switchConcept(pillar.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#1E293B] border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                    : "bg-[#0F172A] border-[#1F2937] text-slate-400 hover:text-slate-200"
                }`}
              >
                {pillar.icon}
                <span>{pillar.shortTag}</span>
              </button>
            );
          })}
        </div>

        {/* Disruption Mode Chaos Simulation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F172A] border border-[#1F2937] rounded-xl mb-4 font-mono text-xs max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                sound.playLock();
                setDisruptionMode(!disruptionMode);
              }}
              className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                disruptionMode
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{disruptionMode ? "DISRUPTION MODE: ON" : "SIMULATE SUPPLY CHAIN SHOCK"}</span>
            </button>

            {disruptionMode && (
              <div className="inline-flex items-center gap-1 p-0.5 bg-[#0B0F19] border border-[#1F2937] rounded-lg">
                <button
                  onClick={() => setDisruptionVector("port_congestion")}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    disruptionVector === "port_congestion"
                      ? "bg-rose-950 text-rose-300 border border-rose-700/60 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Port Congestion (+14d Demurrage)
                </button>
                <button
                  onClick={() => setDisruptionVector("fuel_spike")}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    disruptionVector === "fuel_spike"
                      ? "bg-rose-950 text-rose-300 border border-rose-700/60 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Bunker Fuel Spike (+18% FSC)
                </button>
                <button
                  onClick={() => setDisruptionVector("red_sea")}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    disruptionVector === "red_sea"
                      ? "bg-rose-950 text-rose-300 border border-rose-700/60 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Red Sea Diversion (+$2,400/FEU)
                </button>
              </div>
            )}
          </div>

          {/* Telemetry Indicator */}
          {disruptionMode ? (
            <div className="text-[11px] text-rose-400 flex items-center gap-1.5 font-bold animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {disruptionVector === "port_congestion"
                  ? "CHAOS ACTIVE: Unwarranted port demurrage hold detected inside tariff free time ($14,250 overbill)"
                  : disruptionVector === "fuel_spike"
                  ? "CHAOS ACTIVE: Retroactive BAF adjustment exceeding FMC published index rate ($6,840 overbill)"
                  : "CHAOS ACTIVE: Unauthorized emergency war risk surcharge without 30d FMC notice ($9,600 overbill)"}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              Deterministic baseline mode · Click shock simulation to test rate card exception resilience
            </div>
          )}
        </div>

        {/* Dynamic Kill Shot Metrics Flash Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono">
          <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-lg">
            <div className="text-[9px] uppercase text-slate-400 font-semibold">
              19 U.S.C. § 1592 Exposure Avoided
            </div>
            <div className="text-base sm:text-xl font-bold text-rose-400 tabular-nums">
              <RollingNumber value={displayedExposureAvoided} />
            </div>
            <div className="text-[10px] text-slate-500">Statutory safe-harbor mitigation</div>
          </div>

          <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-lg">
            <div className="text-[9px] uppercase text-slate-400 font-semibold">
              Pre-Payment Freight Overbilling Intercepted
            </div>
            <div className="text-base sm:text-xl font-bold text-rose-400 tabular-nums">
              <RollingNumber value={displayedCarrierOverbilling} />
            </div>
            <div className="text-[10px] text-slate-500">Withheld prior to cash disbursement</div>
          </div>

          <div className="bg-[#0F172A] border border-[#1F2937] px-4 py-3 rounded-lg">
            <div className="text-[9px] uppercase text-slate-400 font-semibold">
              99% Duty Drawback Cash Unlocked
            </div>
            <div className="text-base sm:text-xl font-bold text-emerald-400 tabular-nums">
              <RollingNumber value={displayedDrawback} />
            </div>
            <div className="text-[10px] text-slate-500">19 U.S.C. § 1313 direct cash refund</div>
          </div>
        </div>

        {/* Hidden Client PDF Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleCustomFileUpload}
        />

        {/* MAIN WORKBENCH BODY: 6 Pillars or Dual-Pane Canvas */}
        {activeConceptId === "concept_4_sanctions" ? (
          <SanctionsGraphViewer onOpenLeadModal={() => setIsModalOpen(true)} />
        ) : activeConceptId === "concept_5_hts" ? (
          <div className="h-[750px] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <HtsClassifierViewer onLeadTrigger={() => setIsModalOpen(true)} />
          </div>
        ) : activeConceptId === "concept_6_valuation" ? (
          <div className="h-[750px] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <CustomsValuationViewer onLeadTrigger={() => setIsModalOpen(true)} />
          </div>
        ) : (
          <div className="h-[750px] flex flex-col lg:flex-row border border-[#1F2937] rounded-xl overflow-hidden bg-[#0B0F19] shadow-2xl">
            {/* LEFT PANE: Canvas PDF Viewer */}
            <div
              className={`w-full lg:w-3/5 h-full border-b lg:border-b-0 lg:border-r border-[#1F2937] flex-col overflow-hidden ${
                mobileTab === "doc" ? "flex" : "hidden lg:flex"
              }`}
            >
              {auditData && (
                <PdfOverlayCanvas
                  documentUrl={auditData.document_url}
                  filename={auditData.document_filename}
                  discrepancies={auditData.discrepancies}
                  activeDiscrepancyId={activeDiscrepancyId}
                  onHoverDiscrepancy={setActiveDiscrepancyId}
                  onClickDiscrepancy={handleBboxClick}
                />
              )}
            </div>

            {/* RIGHT PANE: Interactive Terminal Bay with 3 Sub-Tabs */}
            <div
              className={`w-full lg:w-2/5 h-full flex-col bg-[#0F172A] overflow-hidden ${
                mobileTab === "findings" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Terminal Bay Header & Tabs */}
              <div className="px-4 py-3 bg-[#0B0F19] border-b border-[#1F2937] flex items-center justify-between shrink-0 font-mono text-xs">
                <div className="inline-flex p-0.5 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                  <button
                    onClick={() => {
                      sound.playTick();
                      setRightTerminalTab("discrepancies");
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      rightTerminalTab === "discrepancies"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Findings ({auditData?.discrepancies.length || 0})
                  </button>

                  <button
                    onClick={() => {
                      sound.playLock();
                      setRightTerminalTab("cargowise");
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                      rightTerminalTab === "cargowise"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>CargoWise XML</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playLock();
                      setRightTerminalTab("developer_api");
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                      rightTerminalTab === "developer_api"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    <span>API Sandbox</span>
                  </button>
                </div>

                {/* PDF Link */}
                <a
                  href={resolveAssetPath(auditData?.document_url || `/nightmares/${auditData?.document_filename}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-slate-400 hover:text-blue-400 flex items-center gap-1 border border-[#1F2937] px-2 py-1 rounded-md transition-colors"
                >
                  <span>PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Sub-Tab 1: Discrepancies Redline */}
              {rightTerminalTab === "discrepancies" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  <BilledVsLawfulDiff conceptId={activeConceptId} />

                  {activeConceptId === "concept_1_customs" && (
                    <PenaltyExposureLadder
                      dutyLossUsd={6000}
                      domesticValueUsd={125000}
                    />
                  )}

                  {activeConceptId === "concept_clean_fob" ? (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-lg font-mono space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Pre-Clearance Certified</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded-sm">
                              100% PASSED
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Clean commercial invoice verified for automated CBP ACE transmission
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0B0F19] border border-emerald-900/40 rounded-md space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300 pb-1.5 border-b border-[#1F2937]">
                          <span className="text-slate-400">19 U.S.C. § 1592 Penalty Exposure:</span>
                          <span className="font-bold text-emerald-400">$0.00 (Zero Duty Loss)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300 pb-1.5 border-b border-[#1F2937]">
                          <span className="text-slate-400">Incoterms 2020 Allocation:</span>
                          <span className="font-bold text-emerald-400">FOB Yantian (Non-Dutiable)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300 pb-1.5 border-b border-[#1F2937]">
                          <span className="text-slate-400">Line Extension Math (500 × $45):</span>
                          <span className="font-bold text-emerald-400">$22,500.00 (Verified)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">HTS Classification Match:</span>
                          <span className="font-bold text-emerald-400">8542.31.0001 (Microcontrollers)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    auditData?.discrepancies.map((disc) => (
                      <DiscrepancyCard
                        key={disc.id}
                        discrepancy={disc}
                        isActive={activeDiscrepancyId === disc.id}
                        onHover={setActiveDiscrepancyId}
                        onClick={handleCardClick}
                        onFocusMobileDoc={() => {
                          setActiveDiscrepancyId(disc.id);
                          setMobileTab("doc");
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Sub-Tab 2: CargoWise eAdaptor XML Viewer */}
              {rightTerminalTab === "cargowise" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <CargoWiseXmlViewer />
                </div>
              )}

              {/* Sub-Tab 3: Developer API Sandbox */}
              {rightTerminalTab === "developer_api" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <DeveloperApiSandbox />
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. ACT 2: INLINE 5-STAGE ARCHITECTURE PIPELINE */}
      <section id="architecture" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <InlineArchitectureFlow />
      </section>

      {/* 5. ACT 3: CARGOWISE VALUE PACK ROI CALCULATOR */}
      <section id="value-pack-roi" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <RoiCalculator onOpenConsultation={() => openConsultation("contingent_audit")} />
      </section>

      {/* 6. ACT 4: PRINCIPAL ARCHITECT'S THESIS SIGNED BY SAMUEL */}
      <section id="architect-thesis" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <ArchitectThesis
          onOpenBooking={() => openConsultation("fractional_advisory")}
          onOpenAudit={() => openConsultation("contingent_audit")}
        />
      </section>

      {/* 7. SUPPLEMENTARY ENTERPRISE DUE DILIGENCE: DIFFERENTIALIST MATRIX */}
      <section id="differentialism" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <DifferentialistMatrix onOpenConsultation={() => openConsultation("contingent_audit")} />
      </section>

      {/* 8. ADVISORY & CONTINGENCY ENGAGEMENT TIERS */}
      <section id="services" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <ExecutiveServices onSelectTier={(tier) => openConsultation(tier)} />
      </section>

      {/* 9. ENTERPRISE FOOTER */}
      <footer className="border-t border-[#1F2937] bg-[#0F172A] py-10 mt-12 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-sm font-bold text-slate-100 mb-1">
              Run a Forensic Pre-Payment Audit on 50 Historical Bills
            </h4>
            <p className="text-xs text-slate-400">
              100% contingent on recovered cash. If Samuel does not uncover carrier overcharges or misclassified tariff exposure, you pay $0.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openConsultation("contingent_audit")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all rounded-md shadow-md"
            >
              <span>Claim Free 50-Bill Audit ($0)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Samuel Rencken · Trade Systems Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Attorney-Client & NDA Protected</span>
            </span>
            <span>·</span>
            <span>Zero Data Retention</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeConceptId={activeConceptId}
        initialServiceTier={selectedServiceTier}
      />

      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        auditData={auditData}
      />

      <FilmTheaterModal
        isOpen={isFilmOpen}
        onClose={() => setIsFilmOpen(false)}
        onOpenLeadModal={() => setIsModalOpen(true)}
      />

      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        initialTab={architectureModalTab}
      />

      <ExecutiveTourOverlay
        isActive={isTourActive}
        onClose={() => setIsTourActive(false)}
        onOpenArchitectureModal={() => {
          setArchitectureModalTab("architecture");
          setIsArchitectureModalOpen(true);
        }}
      />

      {isFunnelStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8">
            <button
              onClick={() => setIsFunnelStudioOpen(false)}
              className="absolute -top-3 -right-3 z-50 p-2 bg-[#1E2533] border border-slate-700 text-slate-300 hover:text-white rounded-full shadow-lg"
              title="Close Funnel Studio"
            >
              <X className="w-5 h-5" />
            </button>
            <FunnelRedesignStudio
              initialMode="variation_a"
              onClose={() => setIsFunnelStudioOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
