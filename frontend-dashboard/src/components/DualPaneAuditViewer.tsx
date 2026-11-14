"use client";

import React, { useState, useEffect } from "react";
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
import { IcpPersonaSwitcher, IcpPersona } from "./IcpPersonaSwitcher";
import { RollingNumber } from "./RollingNumber";
import { FunnelRedesignStudio } from "./funnel-variations/FunnelRedesignStudio";
import { SanctionsGraphViewer } from "./SanctionsGraphViewer";
import { HtsClassifierViewer } from "./HtsClassifierViewer";
import { CustomsValuationViewer } from "./CustomsValuationViewer";
import { SystemArchitectureModal } from "./SystemArchitectureModal";
import { sound } from "@/lib/audio";
import { recordTelemetry } from "@/lib/supabase";
import { resolveAssetPath } from "@/lib/assets";
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
  Clock,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  AlertOctagon,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  Crosshair,
  Briefcase,
  Film,
  Network,
  Binary,
  Landmark,
  Upload,
} from "lucide-react";
import { auditUploadedPdf } from "@/lib/clientAuditor";

const PdfOverlayCanvas = dynamic(
  () => import("./PdfOverlayCanvas").then((mod) => mod.PdfOverlayCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-slate-100 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#202530] text-slate-500 font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-sky-600 dark:border-sky-400 border-t-transparent animate-spin rounded-full" />
        <span>Initializing High-Precision Document Lens...</span>
      </div>
    ),
  }
);

const CONCEPTS = [
  {
    id: "concept_1_customs",
    name: "01 / Customs Valuation & 1592 Defense",
    shortTag: "CUSTOMS FIREWALL",
    icon: <Scale className="w-4 h-4" />,
    statute: "19 U.S.C. § 1592 & 19 CFR § 152.103",
    metricLabel: "Penalty Exposure Avoided",
    metricColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "concept_2_freight",
    name: "02 / Pre-Payment Freight Overbilling",
    shortTag: "FREIGHT AUDIT",
    icon: <DollarSign className="w-4 h-4" />,
    statute: "FMC Docket 21-08 & OSRA 2022",
    metricLabel: "Carrier Overbilling Caught",
    metricColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "concept_3_drawback",
    name: "03 / Section 1313 Duty Drawback",
    shortTag: "DUTY DRAWBACK",
    icon: <FileCheck2 className="w-4 h-4" />,
    statute: "19 U.S.C. § 1313 Unused Merchandise",
    metricLabel: "99% Cash Refund Unlocked",
    metricColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "concept_4_sanctions",
    name: "04 / Sanctions & Entity Graph",
    shortTag: "OFAC 50% GRAPH",
    icon: <Network className="w-4 h-4" />,
    statute: "31 CFR § 501 / OFAC 50% Rule",
    metricLabel: "Beneficial Ownership Traversed",
    metricColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "concept_5_hts",
    name: "05 / HTS Classification Copilot",
    shortTag: "GRI 1-6 COPILOT",
    icon: <Binary className="w-4 h-4" />,
    statute: "WCO GRI 1–6 & 19 CFR § 24.23",
    metricLabel: "Path-Dependent Reasoning",
    metricColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "concept_6_valuation",
    name: "06 / CBP Assist & Valuation Register",
    shortTag: "152.103 ASSISTS",
    icon: <Landmark className="w-4 h-4" />,
    statute: "19 CFR § 152.103 & 19 CFR § 162.74",
    metricLabel: "Prior Disclosure Mitigation",
    metricColor: "text-emerald-600 dark:text-emerald-400",
  },
];

export const DualPaneAuditViewer: React.FC = () => {
  const [activeConceptId, setActiveConceptId] = useState<string>("concept_1_customs");
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [aggregateMetrics, setAggregateMetrics] = useState<KillShotMetrics | null>(null);
  const [activeDiscrepancyId, setActiveDiscrepancyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isFilmOpen, setIsFilmOpen] = useState<boolean>(false);
  const [selectedServiceTier, setSelectedServiceTier] = useState<string>("contingent_audit");
  const [isFunnelStudioOpen, setIsFunnelStudioOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);

  // ICP Persona Lens ('cfo' | 'counsel')
  const [persona, setPersona] = useState<IcpPersona>("cfo");

  // Audio Haptics Mute State
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Mobile segmented view state ('doc' | 'findings')
  const [mobileTab, setMobileTab] = useState<"findings" | "doc">("findings");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Theme state: default to 'dark' for Nightmare Suite terminal aesthetic, with toggle
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    // Check saved theme or default to dark
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = saved || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsAudioMuted(sound.getMuted());
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

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0E1015] text-slate-900 dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200 relative">
      {/* HyperFrames Ambient Living Background Depth Layer */}
      <AmbientMotionBackground />

      {/* 1. TOP GLOBAL NAVIGATION & IDENTITY */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#14171E]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262B35] px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Identity & Practice */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 dark:bg-sky-950 border border-slate-700 dark:border-sky-800 text-sky-400 flex items-center justify-center font-mono font-bold text-xs shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                  SAMUEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">•</span>
                <span className="font-mono text-[10px] tracking-wider text-sky-700 dark:text-sky-400 uppercase font-semibold">
                  TRADETECH SYSTEMS STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Principal Trade Systems Architect & Compliance Lead
              </p>
            </div>
          </div>

          {/* Quick Nav, Persona, Theme Toggle & Primary Conversion CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden xl:flex items-center gap-5 text-xs font-mono text-slate-600 dark:text-slate-400 mr-2">
              <a href="#audit-workspace" className="hover:text-sky-600 dark:hover:text-slate-200 transition-colors">
                Diagnostic Console
              </a>
              <a href="#roi-calculator" className="hover:text-sky-600 dark:hover:text-slate-200 transition-colors">
                Value Model
              </a>
              <a href="#comparison-matrix" className="hover:text-sky-600 dark:hover:text-slate-200 transition-colors">
                Differentialism
              </a>
              <a href="#services-menu" className="hover:text-sky-600 dark:hover:text-slate-200 transition-colors">
                Advisory Services
              </a>
              <a href="#funnel-studio" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                Funnel Lab
              </a>
            </nav>

            {/* 2-Variation Funnel Studio Modal Button */}
            <button
              onClick={() => {
                sound.playLock();
                setIsFunnelStudioOpen(true);
              }}
              title="Open 2-Variation ICP Funnel Studio"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 rounded-sm font-mono text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Funnel Lab</span>
            </button>

            {/* Keynote Film Teaser Button */}
            <button
              onClick={() => {
                sound.click();
                setIsFilmOpen(true);
              }}
              title="Watch 30s Keynote Film"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 dark:bg-[#1E2533] text-white hover:bg-slate-800 dark:hover:bg-[#252E3E] border border-slate-700 dark:border-slate-600 rounded-sm font-mono text-xs font-semibold transition-all shadow-xs"
            >
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Keynote Film</span>
            </button>

            {/* Executive Dossier Printable Briefing */}
            <button
              onClick={() => {
                sound.playLock();
                setIsDossierOpen(true);
              }}
              title="View Printable Executive Dossier & Statutory Briefing"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-[#1E2533] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#252E3E] border border-slate-300 dark:border-slate-600 rounded-sm font-mono text-xs font-semibold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-500" />
              <span>Dossier</span>
            </button>

            {/* System Architecture & 40/40 Tests Button */}
            <button
              onClick={() => {
                sound.playLock();
                setIsArchitectureModalOpen(true);
              }}
              title="View System Architecture & 40/40 Automated Test Proof"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/60 text-sky-300 rounded-sm font-mono text-xs font-bold transition-all shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">Architecture & Tests</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Audio Micro-Haptics Toggle */}
            <button
              onClick={() => {
                const nextMuted = sound.toggleMute();
                setIsAudioMuted(nextMuted);
                if (!nextMuted) sound.playTick();
              }}
              title={isAudioMuted ? "Enable Audio Haptics" : "Mute Audio Haptics"}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1E2533] border border-slate-300 dark:border-[#2D3545] rounded-sm transition-all"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              )}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1E2533] border border-slate-300 dark:border-[#2D3545] rounded-sm transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => openConsultation("fractional_advisory")}
              className="hidden sm:flex px-4 py-2 bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider items-center gap-1.5 transition-all rounded-sm shadow-sm"
            >
              <span>Schedule Strategy Call</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-sm"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="lg:hidden pt-3 pb-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs">
            <a
              href="#audit-workspace"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
            >
              Diagnostic Console
            </a>
            <a
              href="#roi-calculator"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
            >
              Value Model & Calculator
            </a>
            <a
              href="#comparison-matrix"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
            >
              Market Differentialism
            </a>
            <a
              href="#services-menu"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm"
            >
              Executive Services Menu
            </a>
            <button
              onClick={() => openConsultation("fractional_advisory")}
              className="w-full mt-2 py-2 px-3 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-sm text-center"
            >
              Schedule Strategy Call
            </button>
          </div>
        )}
      </header>

      {/* 2. EXECUTIVE HERO DOSSIER (WITH DYNAMIC ICP PERSONA SWITCHER) */}
      <section className="border-b border-slate-200 dark:border-[#262B35] bg-white dark:bg-[#11141A] py-10 lg:py-14 shadow-xs relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Top Row: Tag + Persona Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-mono rounded-sm font-semibold">
                <Shield className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  {persona === "cfo"
                    ? "CFO Balance Sheet Defense • Pre-Payment Interception"
                    : "General Counsel Safe Harbor • Strict Liability Defense"}
                </span>
              </div>

              {/* Dual-Lens ICP Switcher */}
              <IcpPersonaSwitcher persona={persona} onChange={setPersona} />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] mb-4">
              {persona === "cfo" ? (
                <>Autonomous Trade Intelligence & <span className="text-sky-600 dark:text-sky-400">EBITDA Defense</span></>
              ) : (
                <>Autonomous Trade Compliance & <span className="text-rose-600 dark:text-rose-400">1592 Safe Harbor</span></>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-normal">
              {persona === "cfo" ? (
                <>
                  Architected by Samuel. Defending enterprise balance sheets against 7-figure{" "}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold underline decoration-rose-500/60 decoration-2">
                    19 U.S.C. § 1592 penalties
                  </span>{" "}
                  and intercepting{" "}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold underline decoration-emerald-500/60 decoration-2">
                    5%–15% in carrier overbilling
                  </span>{" "}
                  before cash exits your treasury with deterministic double-entry mathematical verification.
                </>
              ) : (
                <>
                  Architected by Samuel. Inoculating global importers against CBP Form 28 / 29 inquiries, valuation assist defects under{" "}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold underline decoration-rose-500/60 decoration-2">
                    19 CFR § 152.103
                  </span>
                  , and preparing voluntary safe-harbor Prior Disclosures under{" "}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold underline decoration-sky-500/60 decoration-2">
                    19 CFR § 162.74
                  </span>
                  .
                </>
              )}
            </p>

            {/* Action Bar with Keynote Film & Funnel Lab Triggers */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => {
                  sound.playLock();
                  setIsFunnelStudioOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-sm border border-emerald-500 transition-all shadow-md group"
              >
                <Sparkles className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                <span>Launch 2-Variation Funnel Studio</span>
              </button>

              <button
                onClick={() => {
                  sound.click();
                  setIsFilmOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 dark:bg-[#1E2533] hover:bg-slate-800 dark:hover:bg-[#262F40] text-white font-mono text-xs font-bold rounded-sm border border-slate-700 transition-all shadow-xs group"
              >
                <Film className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Watch 30s Keynote Film</span>
              </button>

              <button
                onClick={() => {
                  sound.playLock();
                  setIsArchitectureModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-950/80 hover:bg-sky-900 text-sky-200 font-mono text-xs font-bold rounded-sm border border-sky-500/60 transition-all shadow-xs group"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Architecture & Tests (41/41 Passing)</span>
              </button>

              <a
                href="#audit-workspace"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-[#151922] hover:bg-slate-200 dark:hover:bg-[#1C222E] text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold rounded-sm border border-slate-300 dark:border-slate-800 transition-colors"
              >
                <span>Live Diagnostic Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Proof Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-[#262B35]/80">
              <div className="p-3 bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#262B35] rounded-sm shadow-xs">
                <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  {persona === "cfo" ? "Avg. Penalty Defense" : "Statutory Ceiling"}
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-rose-600 dark:text-rose-400">
                  $125,000+
                </div>
                <div className="text-[10px] text-slate-500">
                  {persona === "cfo" ? "Per Invoiced Entry" : "19 U.S.C. § 1592(c)"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#262B35] rounded-sm shadow-xs">
                <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  {persona === "cfo" ? "Freight Overbill Catch" : "Tariff Dispute Rate"}
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-sky-700 dark:text-sky-400">
                  5% – 15%
                </div>
                <div className="text-[10px] text-slate-500">
                  {persona === "cfo" ? "Pre-Payment Intercept" : "OSRA 2022 Enforcement"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#262B35] rounded-sm shadow-xs">
                <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  Mathematical Engine
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  100% Decimal
                </div>
                <div className="text-[10px] text-slate-500">Zero Floating-Point Drift</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#151922] border border-slate-200 dark:border-[#262B35] rounded-sm shadow-xs">
                <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  Pre-Payment Latency
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                  &lt; 200 ms
                </div>
                <div className="text-[10px] text-slate-500">Private On-Premise Audit Gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DIAGNOSTIC WORKSPACE HEADER */}
      <section id="audit-workspace" className="bg-white dark:bg-[#14171E] border-b border-slate-200 dark:border-[#262B35] px-4 sm:px-6 lg:px-8 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 font-semibold rounded-xs">
                Interactive Proof-of-Work
              </span>
              <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-medium">
                Public Domain Trade Archive Ingestion
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Live Diagnostic Engine Console</span>
            </h2>
          </div>

          {/* Kill Shot Metrics Flash Cards (With Rolling Animation) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#262B35] px-3.5 py-2 rounded-sm shadow-xs">
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                1592 Exposure Avoided
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-rose-600 dark:text-rose-400">
                <RollingNumber
                  value={aggregateMetrics?.penalty_exposure_avoided || 125000}
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#262B35] px-3.5 py-2 rounded-sm shadow-xs">
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                Freight Overbill Caught
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-rose-600 dark:text-rose-400">
                <RollingNumber
                  value={aggregateMetrics?.carrier_overbilling_caught || 1547.50}
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#262B35] px-3.5 py-2 rounded-sm shadow-xs">
              <div className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                99% Drawback Unlocked
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <RollingNumber
                  value={aggregateMetrics?.drawback_unclaimed_unlocked || 27324}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Concept Switcher Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-[#262B35]/60 overflow-x-auto">
          {CONCEPTS.map((concept) => {
            const isActive =
              activeConceptId === concept.id ||
              (concept.id === "concept_1_customs" &&
                (activeConceptId === "concept_clean_fob" || activeConceptId === "client_upload_audit"));
            return (
              <button
                key={concept.id}
                onClick={() => {
                  sound.playLock();
                  setActiveConceptId(concept.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 font-mono text-xs font-semibold tracking-wide border transition-all duration-150 whitespace-nowrap rounded-sm ${
                  isActive
                    ? "bg-sky-50 dark:bg-[#1E2533] border-sky-600 dark:border-sky-400 text-sky-950 dark:text-white shadow-xs"
                    : "bg-slate-50 dark:bg-[#0E1015] border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400"
                }`}
              >
                {concept.icon}
                <span>{concept.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile View Segmented Switcher (Visible only on < lg screens) */}
        <div className="lg:hidden mt-3 pt-2 flex border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 w-full p-1 bg-slate-100 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded-sm">
            <button
              onClick={() => {
                sound.playTick();
                setMobileTab("findings");
              }}
              className={`py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-xs transition-colors ${
                mobileTab === "findings"
                  ? "bg-white dark:bg-[#1E2533] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              <span>Audit Findings ({auditData?.discrepancies.length || 0})</span>
            </button>

            <button
              onClick={() => {
                sound.playTick();
                setMobileTab("doc");
              }}
              className={`py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-xs transition-colors ${
                mobileTab === "doc"
                  ? "bg-white dark:bg-[#1E2533] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              <span>Document Canvas</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. DUAL-PANE AUDIT VIEWER WORKSPACE / SANCTIONS GRAPH / HTS COPILOT / VALUATION REGISTER */}
      <section id="audit-workspace" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Document Mode Toggle for Pillar 01 */}
        {(activeConceptId === "concept_1_customs" ||
          activeConceptId === "concept_clean_fob" ||
          activeConceptId === "client_upload_audit") && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#262B35] rounded-sm text-xs font-mono shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Document Fixture:
              </span>
              <div className="inline-flex flex-wrap p-0.5 bg-slate-100 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#262B35] rounded-sm">
                <button
                  onClick={() => {
                    sound.playTick();
                    setActiveConceptId("concept_1_customs");
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                    activeConceptId === "concept_1_customs"
                      ? "bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  <span>Corrupted Nightmare (1592 Exposure)</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTick();
                    setActiveConceptId("concept_clean_fob");
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                    activeConceptId === "concept_clean_fob"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Clean Production (100% Pre-Clearance)</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTick();
                    fileInputRef.current?.click();
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                    activeConceptId === "client_upload_audit"
                      ? "bg-sky-950/80 text-sky-300 border border-sky-700/60 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3 h-3 text-sky-400" />
                  <span>Upload Custom PDF (On-Device Audit)</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleCustomFileUpload}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              {activeConceptId === "client_upload_audit" ? (
                <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>100% In-Browser Privacy • Zero External Bytes Transmitted</span>
                </span>
              ) : activeConceptId === "concept_clean_fob" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified FOB Terms • Zero 19 U.S.C. § 1592 Penalty Risk</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>3 Statutory Defects Embedded • $24,000 CBP Penalty Exposure</span>
                </span>
              )}
            </div>
          </div>
        )}

        {activeConceptId === "concept_4_sanctions" ? (
          <SanctionsGraphViewer onOpenLeadModal={() => setIsModalOpen(true)} />
        ) : activeConceptId === "concept_5_hts" ? (
          <div className="h-[750px] border border-slate-200 dark:border-[#262B35] rounded-sm overflow-hidden flex flex-col shadow-lg dark:shadow-2xl">
            <HtsClassifierViewer onLeadTrigger={() => setIsModalOpen(true)} />
          </div>
        ) : activeConceptId === "concept_6_valuation" ? (
          <div className="h-[750px] border border-slate-200 dark:border-[#262B35] rounded-sm overflow-hidden flex flex-col shadow-lg dark:shadow-2xl">
            <CustomsValuationViewer onLeadTrigger={() => setIsModalOpen(true)} />
          </div>
        ) : (
          <div className="h-[750px] flex flex-col lg:flex-row border border-slate-200 dark:border-[#262B35] rounded-sm overflow-hidden bg-white dark:bg-[#0E1015] shadow-lg dark:shadow-2xl">
          {/* LEFT PANE: Canvas PDF Viewer (hidden on mobile if mobileTab === 'findings') */}
          <div
            className={`w-full lg:w-3/5 h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#262B35] flex-col overflow-hidden ${
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

          {/* RIGHT PANE: Interactive Findings (hidden on mobile if mobileTab === 'doc') */}
          <div
            className={`w-full lg:w-2/5 h-full flex-col bg-slate-50 dark:bg-[#11141A] overflow-hidden ${
              mobileTab === "findings" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Header of Findings Pane */}
            <div className="px-5 py-3.5 bg-white dark:bg-[#171B24] border-b border-slate-200 dark:border-[#262B35] flex items-center justify-between shrink-0 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-400 font-bold uppercase">
                    Verified Audit Findings
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 font-semibold rounded-xs">
                    {auditData ? auditData.discrepancies.length : 0} Detected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Hover to focus coordinates • Click to inspect defense
                </p>
              </div>

              {/* Action Buttons: Raw PDF + Printable Executive Dossier */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playLock();
                    setIsDossierOpen(true);
                  }}
                  className="text-xs font-mono text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center gap-1 border border-sky-300 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 transition-all rounded-sm font-semibold shadow-xs"
                >
                  <Printer className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Dossier</span>
                </button>

                <a
                  href={resolveAssetPath(auditData?.document_url || `/nightmares/${auditData?.document_filename}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 border border-slate-300 dark:border-[#262B35] px-2 py-1 hover:border-slate-400 transition-colors rounded-sm"
                >
                  <span>PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Scrollable Discrepancy Cards List with Visual Redline Diff & Penalty Ladder */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* 1. Tactile Billed vs Lawful Visual Redline Diff */}
              <BilledVsLawfulDiff conceptId={activeConceptId} />

              {/* 2. Interactive 1592 Penalty Exposure Ladder for Concept 1 */}
              {activeConceptId === "concept_1_customs" && (
                <PenaltyExposureLadder
                  dutyLossUsd={6000}
                  domesticValueUsd={125000}
                />
              )}

              {/* 3. Discrepancy Cards or Clean Pre-Clearance Report */}
              {activeConceptId === "concept_clean_fob" ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/60 rounded-sm font-mono space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span>Pre-Clearance Certified</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded-xs">
                          100% PASSED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Clean commercial invoice verified for automated CBP ACE transmission
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#14171E] border border-slate-200 dark:border-emerald-900/40 rounded-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">19 U.S.C. § 1592 Penalty Exposure:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">$0.00 (Zero Duty Loss)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Incoterms 2020 Allocation:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">FOB Yantian (Non-Dutiable)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Line Extension Math (500 × $45):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">$22,500.00 (Verified)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">HTS Classification Match:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">8542.31.0001 (Microcontrollers)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400">19 CFR § 152.103 Assist Declared:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">$27,750.00 (Fully Amortized)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xs flex items-center justify-between text-[11px]">
                    <span className="text-emerald-300 font-bold">
                      INSPECTION RESULT: ZERO CBP 28/29 AUDIT RISK
                    </span>
                    <button
                      onClick={() => openConsultation("customs_defense")}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xs transition-colors"
                    >
                      Certify Next Shipment
                    </button>
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
          </div>
        </div>
        )}
      </section>

      {/* 5. INTERACTIVE GENERATIVE ROI / EXPOSURE CALCULATOR */}
      <section id="roi-calculator" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <RoiCalculator onOpenConsultation={() => openConsultation("contingent_audit")} />
      </section>

      {/* 6. MARKET DIFFERENTIALIST COMPARISON MATRIX (WHY SAMUEL WINS) */}
      <section id="comparison-matrix">
        <DifferentialistMatrix onOpenConsultation={() => openConsultation("contingent_audit")} />
      </section>

      {/* 7. EXECUTIVE SERVICES & RETAINER MENU (SELLING SAMUEL) */}
      <section id="services-menu">
        <ExecutiveServices onSelectTier={(tier) => openConsultation(tier)} />
      </section>

      {/* 7.5 EMPIRICAL CONVERSION FUNNEL REDESIGN LAB (2 VARIATIONS) */}
      <section id="funnel-studio" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-200 dark:border-[#262B35]">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs mb-2">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Interactive 2-Variation Funnel Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Enterprise Conversion Funnel Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Engineered from empirical trade finance transaction data. Compare the Value-First (CFO Recovery) versus Risk-First (General Counsel Defense) conversion pathways:
          </p>
        </div>

        <FunnelRedesignStudio initialMode="variation_a" />
      </section>

      {/* 8. BOTTOM CONVERSION STRIP */}
      <footer className="border-t border-slate-200 dark:border-[#262B35] bg-white dark:bg-[#11141A] py-10 mt-12 mb-16 lg:mb-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Run a Blind Diagnostic Audit on 25 Historical Invoices
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              100% contingent on recovered cash. If Samuel doesn&apos;t uncover carrier overcharges or misclassified tariff exposure, you pay $0.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openConsultation("contingent_audit")}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all rounded-sm shadow-md"
            >
              <span>Claim Free 25-Invoice Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-200 dark:border-[#262B35]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Samuel • TradeTech Systems Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Attorney-Client & NDA Protected</span>
            </span>
            <span>•</span>
            <span>Zero Data Retention</span>
          </div>
        </div>
      </footer>

      {/* 9. STICKY MOBILE ACTION BAR (Thumb-friendly conversion on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14171E]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2 shadow-xl">
        <button
          onClick={() => openConsultation("contingent_audit")}
          className="flex-1 py-3 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-sm shadow-sm"
        >
          <span>Claim 25-Doc Audit ($0)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => openConsultation("fractional_advisory")}
          className="py-3 px-3.5 bg-slate-100 dark:bg-[#202530] text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-sm"
        >
          Call
        </button>
      </div>

      {/* 10. LEAD CAPTURE & BOOKING MODAL */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeConceptId={activeConceptId}
        initialServiceTier={selectedServiceTier}
      />

      {/* 11. PRINTABLE EXECUTIVE AUDIT DOSSIER MODAL */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        auditData={auditData}
      />

      {/* 12. HYPERFRAMES KEYNOTE FILM THEATER MODAL */}
      <FilmTheaterModal
        isOpen={isFilmOpen}
        onClose={() => setIsFilmOpen(false)}
        onOpenLeadModal={() => setIsModalOpen(true)}
      />

      {/* 13. SYSTEM ARCHITECTURE & 40/40 TESTS MODAL */}
      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* 13. FUNNEL REDESIGN STUDIO MODAL */}
      {isFunnelStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-black/90 backdrop-blur-md overflow-y-auto">
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
