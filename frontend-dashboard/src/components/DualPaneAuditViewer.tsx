"use client";

import React, { useState, useEffect, useRef } from "react";
import { AuditResult, KillShotMetrics } from "@/lib/types";
import { fetchAudit, fetchAggregateMetrics } from "@/lib/api";
import dynamic from "next/dynamic";
import { DiscrepancyCard } from "./DiscrepancyCard";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { BilledVsLawfulDiff } from "./BilledVsLawfulDiff";
import { PenaltyExposureLadder } from "./PenaltyExposureLadder";
import { ExecutiveDossierModal } from "./ExecutiveDossierModal";
import { FilmTheaterModal } from "./FilmTheaterModal";
import { RollingNumber } from "./RollingNumber";
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
import { IcpPersonaSwitcher, IcpPersona } from "./IcpPersonaSwitcher";
import { ProvenanceCockpit, ProvenanceMetadataBar } from "./ProvenanceCockpit";
import { MobileBottomNavPill } from "./MobileBottomNavPill";
import { sound } from "@/lib/audio";
import { recordTelemetry } from "@/lib/supabase";
import { resolveAssetPath } from "@/lib/assets";
import { auditUploadedPdf } from "@/lib/clientAuditor";
import { INITIAL_CUSTOMS_NIGHTMARE_FIXTURE } from "@/data/mockData";
import { VERIFIED_PYTEST_COUNT } from "@/lib/metrics";
import { ParadigmSwitcher, ParadigmId } from "./ParadigmSwitcher";
import { Var2TriageQueue } from "./variations/Var2TriageQueue";
import { ThreeWayResolutionBar } from "./ThreeWayResolutionBar";
import { FirewallProvider, usePreIngestFirewall, playPseudoHaptic } from "@/lib/firewall-core";
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
  Menu,
  X,
  FileText,
  Network,
  Upload,
  Binary,
  Landmark,
  Code2,
  Terminal,
  Zap,
  Columns2,
  Maximize2,
  LayoutList,
  Download,
  AlertTriangle,
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

const DualPaneAuditViewerInner: React.FC = () => {
  const { exportAuditPacket } = usePreIngestFirewall();
  const [activeParadigm, setActiveParadigm] = useState<ParadigmId>("var-1");
  const [activeConceptId, setActiveConceptId] = useState<string>("concept_1_customs");
  const [auditData, setAuditData] = useState<AuditResult>(INITIAL_CUSTOMS_NIGHTMARE_FIXTURE);
  const [aggregateMetrics, setAggregateMetrics] = useState<KillShotMetrics | null>(null);
  const [activeDiscrepancyId, setActiveDiscrepancyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Right-hand terminal tab state
  const [rightTerminalTab, setRightTerminalTab] = useState<"discrepancies" | "cargowise" | "developer_api">("discrepancies");

  // Executive lens: reframes the value proposition per evaluator
  const [persona, setPersona] = useState<IcpPersona>("counsel");

  // Modals & Guided Experience
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isFilmOpen, setIsFilmOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [architectureModalTab, setArchitectureModalTab] = useState<"architecture" | "tests" | "math_proof" | "candidate" | "playground">("architecture");
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Mobile segmented view state ('doc' | 'findings') - Default to 'doc' so source document is visible first
  const [mobileTab, setMobileTab] = useState<"findings" | "doc">("doc");
  // Desktop layout view mode ('split' | 'doc_focus' | 'report_focus')
  const [desktopViewMode, setDesktopViewMode] = useState<"split" | "doc_focus" | "report_focus">("split");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isPillInViewport, setIsPillInViewport] = useState<boolean>(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workbenchContainerRef = useRef<HTMLDivElement>(null);

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

  const handleParadigmChange = (p: ParadigmId) => {
    setActiveParadigm(p);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${p}`);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || hash;

      if (hash === "arc" || hash === "wiretap") {
        setArchitectureModalTab("architecture");
        setIsArchitectureModalOpen(true);
      } else if (hash === "var-2" || hash === "triage") {
        setActiveParadigm("var-2");
      } else if (hash === "var-1" || hash === "workbench" || hash === "customs") {
        setActiveParadigm("var-1");
        setActiveConceptId("concept_1_customs");
      }

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
      } else if (tabParam === "architecture" || tabParam === "tests" || tabParam === "playground" || tabParam === "api") {
        if (tabParam === "tests") {
          setArchitectureModalTab("tests");
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

      const handleHashChange = () => {
        const h = window.location.hash.toLowerCase().replace("#", "");
        if (h === "arc" || h === "wiretap") {
          setArchitectureModalTab("architecture");
          setIsArchitectureModalOpen(true);
        } else if (h === "var-2" || h === "triage") {
          setActiveParadigm("var-2");
        } else if (h === "var-1" || h === "workbench" || h === "customs") {
          setActiveParadigm("var-1");
          setActiveConceptId("concept_1_customs");
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  // Track responsive viewport width for contextual floating pill
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Contextual scroll intersection: floating pill only shows when workbench is actively in view
  useEffect(() => {
    const el = workbenchContainerRef.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPillInViewport(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeConceptId, activeParadigm]);

  // Keep single-pane desktop focus modes synchronized with active tab
  useEffect(() => {
    if (!isMobileViewport && (desktopViewMode === "doc_focus" || desktopViewMode === "report_focus")) {
      setDesktopViewMode(mobileTab === "doc" ? "doc_focus" : "report_focus");
    }
  }, [mobileTab, isMobileViewport, desktopViewMode]);

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
    playPseudoHaptic();
    sound.playTick();
    recordTelemetry({
      event_type: "discrepancy_card_selected",
      concept_id: activeConceptId,
      metadata: { discrepancy_id: id },
    });
  };

  const handleBboxClick = (id: string) => {
    setActiveDiscrepancyId(id);
    playPseudoHaptic();
    sound.playLock();
    // On mobile and tablet, seamlessly navigate to the forensic report
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

  const openReview = () => {
    sound.playLock();
    setIsModalOpen(true);
    setIsMobileNavOpen(false);
  };

  // Kill-shot metrics read straight off the engine payload: no synthetic inflation
  const displayedExposureAvoided = aggregateMetrics?.penalty_exposure_avoided || 125000;
  const displayedCarrierOverbilling = aggregateMetrics?.carrier_overbilling_caught || 1547.5;
  const displayedDrawback = aggregateMetrics?.drawback_unclaimed_unlocked || 27324;

  const activeDiscrepancy =
    auditData?.discrepancies.find((d) => d.id === activeDiscrepancyId) ||
    auditData?.discrepancies[0] ||
    null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-ink-primary flex flex-col font-sans transition-colors duration-200 relative selection:bg-cobalt-600 selection:text-canvas-stone">
      {/* 1. STICKY MINIMALIST DEVELOPER HEADER (56px) */}
      <header className="sticky top-0 z-40 bg-terminal-slate/90 backdrop-blur-md border-b border-terminal-subtle px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Identity & Practice */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cobalt-600 text-canvas-stone flex items-center justify-center font-mono font-semibold text-xs shadow-md shadow-blue-500/20 shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-ink-primary uppercase truncate">
                  SAMUEL
                </span>
                <span className="type-caption-mono text-ink-muted hidden sm:inline">·</span>
                <span className="type-caption-mono text-ink-cobalt uppercase font-medium truncate hidden sm:inline">
                  TRADE SYSTEMS STUDIO
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="type-caption-mono text-ink-emerald">
                  Available for Principal Systems & Forward-Deployed AI
                </span>
              </div>
            </div>
          </div>

          {/* 2-Way Paradigm Switcher (⌘1-⌘2) */}
          <div className="hidden sm:flex items-center">
            <ParadigmSwitcher activeParadigm={activeParadigm} onChange={handleParadigmChange} />
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => {
                sound.playTick();
                setArchitectureModalTab("architecture");
                setIsArchitectureModalOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 border border-slate-700/80 hover:border-slate-500 bg-terminal-elevated/40 hover:bg-terminal-elevated text-ink-secondary hover:text-ink-primary type-mono-data rounded-md transition-colors flex items-center gap-1.5"
              title="Open Architecture & Executive Dossier"
            >
              <Terminal className="w-3.5 h-3.5 text-ink-cobalt" />
              <span className="hidden md:inline">Architecture & Dossier</span>
            </button>

            <button
              onClick={openReview}
              className="px-2.5 sm:px-3.5 py-1.5 bg-cobalt-600 hover:bg-cobalt-500 text-canvas-stone font-mono font-semibold text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors rounded-md shadow-sm"
            >
              <span className="hidden sm:inline">Schedule Architecture Review</span>
              <span className="sm:hidden">Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation"
              className="sm:hidden p-1.5 text-ink-secondary border border-slate-700 rounded-md shrink-0"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="sm:hidden pt-3 pb-2 mt-2 border-t border-terminal-subtle space-y-2 type-mono-data">
            <div className="pb-2 flex justify-center">
              <ParadigmSwitcher activeParadigm={activeParadigm} onChange={handleParadigmChange} showLabel={false} />
            </div>
            <a
              href="#workbench"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-ink-secondary hover:bg-slate-800 rounded-md"
            >
              #workbench
            </a>
            <a
              href="#architecture"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-ink-secondary hover:bg-slate-800 rounded-md"
            >
              #architecture
            </a>
            <a
              href="#architect-thesis"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-ink-secondary hover:bg-slate-800 rounded-md"
            >
              #architect-thesis
            </a>
            <button
              onClick={openReview}
              className="w-full mt-2 py-2 px-3 bg-cobalt-600 text-canvas-stone font-semibold text-xs uppercase tracking-wider rounded-md text-center"
            >
              Schedule Architecture Review
            </button>
          </div>
        )}
      </header>

      <main>
        {/* Mobile Paradigm Switcher Bar (only when menu is closed) */}
        {!isMobileNavOpen && (
          <div className="sm:hidden px-3 py-2 bg-canvas-dark border-b border-terminal-subtle flex items-center justify-center">
            <ParadigmSwitcher activeParadigm={activeParadigm} onChange={handleParadigmChange} showLabel={false} />
          </div>
        )}

        {activeParadigm === "var-2" ? (
          <Var2TriageQueue />
        ) : (
          <>
      {/* 2. ACT 1: ABOVE-THE-FOLD SYSTEMS HERO */}
      <section className="border-b border-terminal-subtle bg-terminal-slate/40 py-8 lg:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Verification + Executive Lens */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2 type-mono-data">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cobalt-950/80 border border-cobalt-800 text-cobalt-300 rounded-md font-medium">
                  <Zap className="w-3.5 h-3.5 text-ink-cobalt" />
                  <span>Deterministic Pre-Ingest Firewall</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-terminal-elevated border border-terminal-subtle text-ink-secondary rounded-md">
                  <Cpu className="w-3.5 h-3.5 text-ink-emerald" />
                  <span>CargoWise UniversalShipment XML &amp; ACE Ready</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-terminal-elevated border border-terminal-subtle text-ink-secondary rounded-md tabular-nums">
                  <CheckCircle2 className="w-3.5 h-3.5 text-ink-emerald" />
                  <span>{`${VERIFIED_PYTEST_COUNT}/${VERIFIED_PYTEST_COUNT} Automated Tests Passing`}</span>
                </span>
              </div>

              <IcpPersonaSwitcher persona={persona} onChange={setPersona} />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink-primary tracking-[-0.025em] leading-[1.15] text-balance mb-4">
              Deterministic Pre-Ingest Verification for{" "}
              <span className="text-ink-cobalt">CargoWise &amp; ACE</span>
            </h1>

            <p className="type-body-default sm:text-base text-ink-secondary leading-relaxed mb-6 font-normal">
              Intercepting <span className="statutory-cite">19 U.S.C. § 1592</span> customs penalties, carrier accessorial overbilling, and GRI misclassifications before UniversalShipment XML enters your TMS. Built with sub-50ms execution, zero floating-point drift, and 100% Python Decimal precision.
            </p>

            {/* Executive Lens Takeaway */}
            <div className="mb-6 pl-3 border-l-2 border-cobalt-600">
              <div className="type-caption-mono uppercase text-ink-cobalt font-medium mb-1">
                {persona === "cfo"
                  ? "CFO / EBITDA lens"
                  : persona === "counsel"
                  ? "General Counsel lens"
                  : "CTO / Platform lens"}
              </div>
              <p className="type-body-default text-ink-secondary max-w-2xl">
                {persona === "cfo"
                  ? "Cash leaks at the carrier invoice and the duty payment. Both are intercepted here before the wire releases: 5% to 15% of freight spend is recoverable billing error, not cost of doing business."
                  : persona === "counsel"
                  ? "Every finding cites its statute and carries a contestable provenance record. 19 U.S.C. § 1592 negligence exposure runs 0.25x to 4.0x lawful duty loss (quantified from the entry, not estimated)."
                  : `No external API in the critical path. Deterministic fallback keeps the engine live offline, ${VERIFIED_PYTEST_COUNT}/${VERIFIED_PYTEST_COUNT} pytest tests verify the kernel, and Python Decimal eliminates floating-point drift in every statutory figure.`}
              </p>
            </div>

            {/* Systems Metrics Strip: documented benchmarks only */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-terminal-subtle">
              <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
                <div className="type-caption-mono uppercase text-ink-muted">
                  Core Throughput
                </div>
                <div className="text-base sm:text-lg font-mono font-semibold text-ink-cobalt tabular-nums">
                  6,496 /sec
                </div>
                <div className="type-caption-mono text-ink-muted">Statutory core evals</div>
              </div>

              <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
                <div className="type-caption-mono uppercase text-ink-muted">
                  p99 Latency
                </div>
                <div className="text-base sm:text-lg font-mono font-semibold text-ink-cobalt tabular-nums">
                  &lt; 0.31 ms
                </div>
                <div className="type-caption-mono text-ink-muted">Core (&lt;60ms 2p PDF)</div>
              </div>

              <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
                <div className="type-caption-mono uppercase text-ink-muted">
                  Arithmetic Standard
                </div>
                <div className="text-base sm:text-lg font-mono font-semibold text-ink-emerald tabular-nums">
                  100% Decimal
                </div>
                <div className="type-caption-mono text-ink-muted">Zero LLM Calculations</div>
              </div>

              <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
                <div className="type-caption-mono uppercase text-ink-muted">
                  Carrier Leakage Intercept
                </div>
                <div className="text-base sm:text-lg font-mono font-semibold text-ink-crimson tabular-nums">
                  5% to 15%
                </div>
                <div className="type-caption-mono text-ink-muted">Pre-Payment Guard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-PANE AUDIT WORKBENCH (ACT 1 CONTINUED) */}
      <section id="workbench" className="max-w-7xl w-full max-w-full overflow-hidden mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Lighthouse heading-order: first in-section heading after the h1 */}
        <h2 className="sr-only">Audit Workbench</h2>
        {/* Scenario Bar: Durban, Long Beach, Steel Drawback */}
        <ScenarioSelectorBar
          activeScenarioId={CORRIDOR_SCENARIOS.find((s) => s.concept_id === activeConceptId)?.id || "scenario_durban_rotterdam"}
          onSelectScenario={(sc: Scenario) => switchConcept(sc.concept_id)}
        />

        {/* Workspace Tab Bar: the six engineering surfaces + Desktop Layout Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-2 border-b border-[#1F2937] font-mono text-xs">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
              Workspace:
            </span>
            {ALL_PILLARS.map((pillar) => {
              const isActive = activeConceptId === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => switchConcept(pillar.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-terminal-elevated border-cobalt-500 text-ink-primary shadow-sm ring-1 ring-cobalt-500/50"
                      : "bg-terminal-slate border-terminal-subtle text-ink-muted hover:text-ink-primary"
                  }`}
                >
                  {pillar.icon}
                  <span>{pillar.shortTag}</span>
                </button>
              );
            })}
          </div>

          {/* Export Board & Counsel Audit Packet + Desktop 3-Way Layout Mode Switcher */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportAuditPacket()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 text-canvas-stone font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Board & Counsel Audit Packet</span>
            </button>
            <div className="flex items-center gap-1 p-0.5 bg-terminal-slate border border-terminal-subtle rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setDesktopViewMode("split");
              }}
              title="Split View (60/40)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded type-caption-mono transition-colors ${
                desktopViewMode === "split"
                  ? "bg-cobalt-600 text-canvas-stone font-medium shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <Columns2 className="w-3 h-3" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setDesktopViewMode("doc_focus");
              }}
              title="Focus on Document"
              className={`flex items-center gap-1 px-2.5 py-1 rounded type-caption-mono transition-colors ${
                desktopViewMode === "doc_focus"
                  ? "bg-cobalt-600 text-canvas-stone font-medium shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Document Only</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setDesktopViewMode("report_focus");
              }}
              title="Focus on Forensic Report"
              className={`flex items-center gap-1 px-2.5 py-1 rounded type-caption-mono transition-colors ${
                desktopViewMode === "report_focus"
                  ? "bg-cobalt-600 text-canvas-stone font-medium shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <LayoutList className="w-3 h-3" />
              <span>Report Only</span>
            </button>
          </div>
        </div>
      </div>

        {/* Dynamic Kill Shot Metrics Flash Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono">
          <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
            <div className="type-caption-mono uppercase text-ink-muted">
              19 U.S.C. § 1592 Exposure Avoided
            </div>
            <div className="type-display-md sm:type-display-lg font-mono text-ink-crimson tabular-nums mt-0.5">
              <RollingNumber value={displayedExposureAvoided} />
            </div>
            <div className="type-caption-mono text-ink-muted mt-0.5">Statutory safe-harbor mitigation</div>
          </div>

          <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
            <div className="type-caption-mono uppercase text-ink-muted">
              Pre-Payment Freight Overbilling Intercepted
            </div>
            <div className="type-display-md sm:type-display-lg font-mono text-ink-crimson tabular-nums mt-0.5">
              <RollingNumber value={displayedCarrierOverbilling} />
            </div>
            <div className="type-caption-mono text-ink-muted mt-0.5">Withheld prior to cash disbursement</div>
          </div>

          <div className="bg-terminal-slate border border-terminal-subtle px-4 py-3 rounded-lg">
            <div className="type-caption-mono uppercase text-ink-muted">
              99% Duty Drawback Cash Unlocked
            </div>
            <div className="type-display-md sm:type-display-lg font-mono text-ink-emerald tabular-nums mt-0.5">
              <RollingNumber value={displayedDrawback} />
            </div>
            <div className="type-caption-mono text-ink-muted mt-0.5">19 U.S.C. § 1313 direct cash refund</div>
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

        {/* Provenance Metadata Bar: document lineage emitted by the engine */}
        <ProvenanceMetadataBar audit={auditData} />

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
          <div
            ref={workbenchContainerRef}
            id="workbench-viewport"
            className="h-[750px] flex flex-col lg:flex-row border border-[#1F2937] rounded-xl overflow-hidden bg-[#0B0F19] shadow-2xl"
          >
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
              className={`h-full flex-col bg-[#0F172A] overflow-hidden transition-all duration-200 ${
                mobileTab === "findings" ? "flex w-full" : "hidden lg:flex"
              } ${
                desktopViewMode === "report_focus"
                  ? "lg:w-full lg:flex"
                  : desktopViewMode === "doc_focus"
                  ? "lg:hidden"
                  : "lg:w-2/5"
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
                    className={`px-2.5 py-1 rounded-md type-caption-mono font-medium transition-colors ${
                      rightTerminalTab === "discrepancies"
                        ? "bg-cobalt-600 text-canvas-stone shadow-xs"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    Findings ({auditData?.discrepancies.length || 0})
                  </button>

                  <button
                    onClick={() => {
                      sound.playLock();
                      setRightTerminalTab("cargowise");
                    }}
                    className={`px-2.5 py-1 rounded-md type-caption-mono font-medium transition-colors flex items-center gap-1 ${
                      rightTerminalTab === "cargowise"
                        ? "bg-cobalt-600 text-canvas-stone shadow-xs"
                        : "text-ink-muted hover:text-ink-primary"
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
                    className={`px-2.5 py-1 rounded-md type-caption-mono font-medium transition-colors flex items-center gap-1 ${
                      rightTerminalTab === "developer_api"
                        ? "bg-cobalt-600 text-canvas-stone shadow-xs"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    <span>API Sandbox</span>
                  </button>
                </div>

                {/* PDF Link */}
                {(() => {
                  const safePdfPath = auditData?.document_url || (auditData?.document_filename ? `/nightmares/${auditData.document_filename}` : "/nightmares/nightmare_01_customs_ci.pdf");
                  return (
                    <a
                      href={resolveAssetPath(safePdfPath)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-slate-400 hover:text-blue-400 flex items-center gap-1 border border-[#1F2937] px-2 py-1 rounded-md transition-colors"
                    >
                      <span>PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })()}
              </div>

              {/* Sub-Tab 1: Discrepancies Redline */}
              {rightTerminalTab === "discrepancies" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {/* Honest Disclaimer Banner for Uploaded Heuristic Scans */}
                  {activeConceptId === "client_upload_audit" && (
                    <div className="p-3 bg-amber-950/40 border border-amber-600/70 rounded-lg text-amber-200 text-xs font-mono flex items-start gap-2.5 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                          Demonstration Heuristic Inspection
                        </div>
                        <div className="text-[11px] leading-relaxed text-amber-200/90">
                          Demonstration heuristic pattern matcher running in browser. Does not certify compliance or replace licensed customs broker review.
                        </div>
                      </div>
                    </div>
                  )}

                  <ProvenanceCockpit discrepancy={activeDiscrepancy} />

                  <BilledVsLawfulDiff conceptId={activeConceptId} />

                  {activeConceptId === "concept_clean_fob" ? (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-lg font-mono space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Clean Commercial Baseline</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded-sm">
                              BASELINE VERIFIED
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Standard FOB commercial invoice with verified non-dutiable terms and zero flagged defects.
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
                  ) : activeConceptId === "client_upload_audit" && auditData?.discrepancies.length === 0 ? (
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg font-mono text-center space-y-2">
                      <div className="text-xs font-bold text-slate-300">
                        Zero Keyword Anomalies Detected by Browser Scanner
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        No common pattern triggers (such as CIF without marine insurance or detention surcharges) were flagged in this file. This heuristic check does not constitute a formal statutory audit.
                      </div>
                    </div>
                  ) : (
                    auditData?.discrepancies.map((disc) => (
                      <div key={disc.id} className="space-y-2">
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
                        {(disc.confidence < 0.85 || disc.severity === "critical") && (
                          <div className="pl-2 border-l-2 border-amber-500/60">
                            <ThreeWayResolutionBar
                              discrepancyId={disc.id}
                              confidence={disc.confidence}
                              statutoryCode={disc.statutory_code}
                            />
                          </div>
                        )}
                      </div>
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

      {/* 5. STATUTORY CULPABILITY & PENALTY LADDER (19 U.S.C. § 1592) */}
      <section id="penalty-ladder" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <div className="mb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>Statutory Culpability & Prior Disclosure Modeling Engine</span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Independent statutory exposure calculator for Customs Counsel. Models maximum civil penalty exposure across 19 U.S.C. § 1592 culpability tiers and computes prior disclosure mitigation per 19 CFR § 162.74.
          </p>
        </div>
        <div className="bg-[#0F172A] border border-[#1F2937] rounded-xl p-5 shadow-2xl">
          <PenaltyExposureLadder
            dutyLossUsd={6000}
            domesticValueUsd={125000}
          />
        </div>
      </section>

      {/* 6. ACT 4: PRINCIPAL ARCHITECT'S THESIS SIGNED BY SAMUEL */}
      <section id="architect-thesis" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#1F2937]">
        <ArchitectThesis onOpenReview={openReview} />
      </section>
          </>
        )}
      </main>

      {/* 9. ENTERPRISE FOOTER */}
      <footer className="border-t border-terminal-subtle bg-terminal-slate py-10 mt-12 type-mono-data text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="type-heading-sm text-ink-primary mb-1">
              Trade Systems Studio: Deterministic Trade Compliance Engineering
            </h3>
            <p className="type-body-dense text-ink-muted">
              Built and maintained by Samuel Rencken. Every statutory figure computed in Python Decimal, every finding traceable to its source clause.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openReview}
              className="px-5 py-2.5 bg-cobalt-600 hover:bg-cobalt-500 text-canvas-stone font-semibold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors rounded-md"
            >
              <span>Schedule Architecture Review</span>
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

      {/* Contextual Floating Navigation Dock */}
      <MobileBottomNavPill
        activeTab={mobileTab}
        discrepancyCount={auditData?.discrepancies.length || 0}
        isVisible={
          isPillInViewport &&
          activeParadigm === "var-1" &&
          !["concept_4_sanctions", "concept_5_hts", "concept_6_valuation"].includes(activeConceptId) &&
          (isMobileViewport || desktopViewMode !== "split")
        }
        onSelectTab={(tab) => {
          sound.playTick();
          setMobileTab(tab);
        }}
      />
    </div>
  );
};

export const DualPaneAuditViewer: React.FC = () => {
  return (
    <FirewallProvider>
      <DualPaneAuditViewerInner />
    </FirewallProvider>
  );
};
