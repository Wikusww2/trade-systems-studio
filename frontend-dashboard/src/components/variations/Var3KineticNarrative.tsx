"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { playPseudoHaptic } from "@/lib/firewall-core";
import {
  Sparkles,
  Cpu,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Scale,
  Zap,
  Globe,
  Award,
  BookOpen,
} from "lucide-react";

interface Var3KineticNarrativeProps {
  onOpenReview?: () => void;
}

export const Var3KineticNarrative: React.FC<Var3KineticNarrativeProps> = ({ onOpenReview }) => {
  const shouldReduceMotion = useReducedMotion();
  const [activePersona, setActivePersona] = useState<"cto" | "cfo">("cto");

  const cardVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      rotateX: shouldReduceMotion ? 0 : -15,
      scale: shouldReduceMotion ? 1 : 0.96,
      clipPath: shouldReduceMotion ? "none" : "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      scale: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: shouldReduceMotion
        ? { duration: 0.01 }
        : {
            type: "spring" as const,
            stiffness: 340,
            damping: 32,
            mass: 0.8,
          },
    },
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-slate-100 font-sans">
      {/* 1. KINETIC HERO BANNER WITH PERSONA SPLIT-LENS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-[#0F172A] border border-[#1F2937] shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kinetic 3D Hardware Telemetry</span>
            </span>
            <span className="text-slate-400">1200px Perspective · 340 Stiff Spring</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dual-Screen Sovereign Trade Verification
          </h2>
          <p className="text-sm text-slate-300 font-normal">
            Switch the evaluation lens below to reveal either the CTO Systems Architecture or the CFO Financial Balance-Sheet impact.
          </p>
        </div>

        {/* 1-Click Persona Lens Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0B0F19] border border-[#1F2937] shrink-0 self-start md:self-center">
          <button
            onClick={() => {
              playPseudoHaptic();
              setActivePersona("cto");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors duration-150 active:scale-[0.982] ${
              activePersona === "cto"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>CTO Systems Lens</span>
          </button>

          <button
            onClick={() => {
              playPseudoHaptic();
              setActivePersona("cfo");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors duration-150 active:scale-[0.982] ${
              activePersona === "cfo"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>CFO Financial Lens</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-DIMENSIONAL PROGRESSIVE DISCLOSURE STAGE */}
      <div style={{ perspective: "1200px" }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Core Verification Kernel */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="p-6 rounded-2xl bg-[#0F172A] border border-[#1F2937] shadow-2xl space-y-4 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
              {activePersona === "cto" ? "STAGE 01: INGESTION HARNESS" : "STAGE 01: CASH DRIFT PREVENTION"}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-white">
            {activePersona === "cto"
              ? "Python Decimal Kernel & Zero Float Drift"
              : "Pre-Payment Freight Intercept: 5% to 15% Savings"}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {activePersona === "cto"
              ? "All statutory valuations, Incoterms CIF allocations, and duty drawback refunds execute in Python Decimal (ROUND_HALF_UP). LLMs are strictly forbidden from performing arithmetic."
              : "Carrier invoices routinely overbill on demurrage accrued during terminal congestion and unauthorized chassis splits. We intercept billing errors prior to cash disbursement."}
          </p>

          <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#1F2937] font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Verified Metric:</span>
              <span className="text-emerald-400 font-bold">
                {activePersona === "cto" ? "< 0.09ms p99 execution" : "$1,547.50 caught per invoice"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Authority:</span>
              <span className="text-slate-300">
                {activePersona === "cto" ? "ADR-001 Decimal Determinism" : "FMC Docket 21-08 / OSRA 2022"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Regulatory Defense & Quarantine */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="p-6 rounded-2xl bg-[#0F172A] border border-[#1F2937] shadow-2xl space-y-4 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
              {activePersona === "cto" ? "STAGE 02: CONFIDENCE GATE" : "STAGE 02: PENALTY SHIELD"}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-white">
            {activePersona === "cto"
              ? "Human-On-The-Loop Quarantine Protocol"
              : "19 U.S.C. § 1592 Defense Safe-Harbor"}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {activePersona === "cto"
              ? "Whenever an extraction or HTS confidence drops below 0.85, UniversalInterchange XML mutation is quarantined until a licensed broker confirms resolution via ThreeWayResolutionBar."
              : "Customs fraud and gross negligence penalties reach up to 4.0x lawful duty loss. Our deterministic pre-clearance generates certified audit dossiers for General Counsel defense."}
          </p>

          <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#1F2937] font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Defense Multiplier:</span>
              <span className="text-red-400 font-bold">
                {activePersona === "cto" ? "Quarantine Floor 0.85" : "0.25x to 4.0x Duty Loss Mitigated"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Authority:</span>
              <span className="text-slate-300">
                {activePersona === "cto" ? "EU AI Act Art. 26 / HAX 9" : "19 U.S.C. § 1592 & 19 CFR § 152.103"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. ACT 4: PRINCIPAL ARCHITECT'S THESIS SIGNED BY SAMUEL */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#0F172A] border border-[#1F2937] shadow-2xl space-y-8 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
            <Award className="w-4 h-4" />
            <span className="uppercase tracking-widest font-bold">
              ACT 4: THE 20% PRINCIPAL ARCHITECT THESIS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why International Trade Requires Sovereign Determinism
          </h2>

          <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-3 pt-1">
            <span>Samuel Rencken</span>
            <span>·</span>
            <span>22 Years Old</span>
            <span>·</span>
            <span>South Africa</span>
            <span>·</span>
            <span>BCom in Economic Sciences (International Trade)</span>
          </div>
        </div>

        {/* Editorial Body rendered in Newsreader Serif */}
        <div className="font-serif text-base sm:text-lg text-slate-200 leading-relaxed max-w-4xl space-y-6 border-l-2 border-blue-500/80 pl-6 sm:pl-8 italic">
          <p>
            Trade software has spent twenty years trapped in CRUD databases and slow ERP migrations. While enterprises pour millions into enterprise forwarder software, the actual point of failure is upstream: corrupt commercial invoices, conflicting Incoterms, and carrier accessorial fees that pass unchecked into general ledgers.
          </p>
          <p>
            Coming from South Africa, you learn early that trade corridors are physical, volatile, and governed by strict statutory rules. When container ships were forced around the Cape of Good Hope during the Red Sea disruption, every extra day of sea transit produced compounding demurrage disputes, detention notices, and currency revaluations between ZAR, EUR, and USD. You cannot solve that with probabilistic LLM guesses. You solve it with deterministic statutory math.
          </p>
          <p>
            An economics degree in international trade teaches you that tariffs, anti-dumping duties, and WCO GRI classifications are legal contracts with statutory penalties. Eighty percent of enterprise trade software is generic bookkeeping; the critical twenty percent is the pre-ingest firewall that inspects the document before it settles. That is the architecture I build.
          </p>
        </div>

        {/* Candidate Signature & Call to Action */}
        <div className="pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="text-slate-400">
            <span>Verified Author: </span>
            <span className="text-white font-bold">Samuel Rencken</span>
            <span className="block text-[11px] text-slate-500">
              Principal TradeTech AI Systems Architect · Candidate for Forward-Deployed AI Lead
            </span>
          </div>

          {onOpenReview && (
            <button
              onClick={() => {
                playPseudoHaptic();
                onOpenReview();
              }}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
