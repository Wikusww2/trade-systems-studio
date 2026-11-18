"use client";

import React, { useState } from "react";
import { ParadigmId } from "../ParadigmSwitcher";
import { playPseudoHaptic } from "@/lib/firewall-core";
import {
  Layers,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Terminal,
  Cpu,
  FileCheck2,
  Table,
  Check,
} from "lucide-react";

interface Var5MasterSynthesisProps {
  onSelectParadigm: (paradigm: ParadigmId) => void;
}

const TOURNAMENT_VARIATIONS = [
  {
    id: "var-1" as ParadigmId,
    number: "01",
    name: "Swiss Hybrid Workbench",
    latency: "< 45ms",
    cognitiveLoad: "Balanced",
    clicksToResolve: "2 clicks",
    targetAudience: "Licensed Customs Broker & Legal Counsel",
    signatureFeat: "6-Pillar Surface, [0, 1000) Docling Canvas, Counsel Packet Export",
  },
  {
    id: "var-2" as ParadigmId,
    number: "02",
    name: "Operator Triage Command Queue",
    latency: "< 12ms",
    cognitiveLoad: "Low (Keyboard)",
    clicksToResolve: "1 key (J/K/Enter)",
    targetAudience: "AP Freight Audit & Operational Triage Leads",
    signatureFeat: "500-Row Virtualized Queue, 14:00:00 Carrier Cutoff, ⌘K Command Bar",
  },
  {
    id: "var-3" as ParadigmId,
    number: "03",
    name: "Kinetic 3D Narrative & Split-Lens",
    latency: "< 65ms",
    cognitiveLoad: "Immersive",
    clicksToResolve: "Guided Story",
    targetAudience: "VP Engineering Screener & Head of Talent",
    signatureFeat: "1200px 3D Unfold, 1-Click Persona Split-Lens, Act 4 Editorial Thesis",
  },
  {
    id: "var-4" as ParadigmId,
    number: "04",
    name: "Wiretap & Defense Console (#arc)",
    latency: "< 25ms",
    cognitiveLoad: "Deep Analytical",
    clicksToResolve: "0 (Telemetry)",
    targetAudience: "TradeTech CTO & Principal Architect",
    signatureFeat: "Upstream Pipeline Topology, XML Diff, Interactive DefenseMap",
  },
];

export const Var5MasterSynthesis: React.FC<Var5MasterSynthesisProps> = ({ onSelectParadigm }) => {
  // Component Cherry-Picker state
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
    countdown: true,
    threeWayBar: true,
    virtualQueue: true,
    xmlDiff: true,
    packetExport: true,
    defenseMap: true,
  });

  const toggleFeature = (key: string) => {
    playPseudoHaptic();
    setSelectedFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const featureList = [
    { key: "countdown", label: "Carrier Cutoff Countdown Timer (14:00:00)", source: "Var 2 (Triage)" },
    { key: "threeWayBar", label: "Three-Way Resolution Bar (HAX Guideline 9)", source: "Var 1 (Workbench)" },
    { key: "virtualQueue", label: "500-Row Virtualized Table (60 FPS)", source: "Var 2 (Triage)" },
    { key: "xmlDiff", label: "UniversalInterchange XML Mutation Diff", source: "Var 4 (Wiretap)" },
    { key: "packetExport", label: "1-Click Board & Counsel Audit Packet Export", source: "Var 1 (Workbench)" },
    { key: "defenseMap", label: "DefenseMap Linking Statute to Code & Tests", source: "Var 4 (Wiretap)" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-slate-100 font-sans">
      {/* 1. ARENA HEADER */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#1F2937] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>PARADIGM TOURNAMENT ARENA</span>
            </span>
            <span className="text-slate-400">Synthesis of Variations 1 through 4</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            4-Variation UI/UX Tournament &amp; Evaluation Synthesis
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="text-emerald-400 font-bold">4 Paradigms Tested</span>
          <span>·</span>
          <span>Zero Fluff</span>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE TOURNAMENT COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {TOURNAMENT_VARIATIONS.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-xl bg-[#0F172A] border border-[#1F2937] hover:border-blue-500/50 shadow-xl flex flex-col justify-between space-y-4 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-blue-400 font-bold">VARIATION {v.number}</span>
                <span className="text-emerald-400 tabular-nums">{v.latency}</span>
              </div>
              <h3 className="font-bold text-white text-base font-sans">{v.name}</h3>
              <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-[#1F2937]">
                <span className="font-semibold text-slate-300">Audience: </span>
                {v.targetAudience}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                <span className="font-semibold text-slate-300">Signature: </span>
                {v.signatureFeat}
              </div>
            </div>

            <button
              onClick={() => {
                playPseudoHaptic();
                onSelectParadigm(v.id);
              }}
              className="w-full py-2 px-3 bg-[#1E293B] hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#334155] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Launch {v.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 3. LATENCY & SYSTEMS PERFORMANCE MATRIX */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Empirical Systems Performance Benchmarks</span>
        </h3>

        <div className="rounded-xl border border-[#1F2937] bg-[#0F172A] overflow-x-auto shadow-2xl font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B0F19] border-b border-[#1F2937] text-[10px] text-slate-400 uppercase">
                <th className="p-3">Variation</th>
                <th className="p-3">Rendering Mechanism</th>
                <th className="p-3 text-right">Throughput</th>
                <th className="p-3 text-right">p99 Latency</th>
                <th className="p-3 text-center">Float Drift</th>
                <th className="p-3 text-center">Accessible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              <tr>
                <td className="p-3 font-bold text-slate-200">Var 1: Swiss Workbench</td>
                <td className="p-3 text-slate-400">OKLCH APCA Dual-Pane Canvas</td>
                <td className="p-3 text-right tabular-nums text-emerald-400 font-bold">24,500/s</td>
                <td className="p-3 text-right tabular-nums text-emerald-400">&lt; 45ms</td>
                <td className="p-3 text-center text-emerald-400 font-bold">0.00%</td>
                <td className="p-3 text-center text-emerald-400">WCAG 2.2 AA</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">Var 2: Operator Triage</td>
                <td className="p-3 text-slate-400">TanStack Virtual 500-Row DOM</td>
                <td className="p-3 text-right tabular-nums text-emerald-400 font-bold">60 FPS Locked</td>
                <td className="p-3 text-right tabular-nums text-emerald-400">&lt; 12ms</td>
                <td className="p-3 text-center text-emerald-400 font-bold">0.00%</td>
                <td className="p-3 text-center text-emerald-400">Full Keyboard (J/K)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">Var 3: Kinetic 3D Unfold</td>
                <td className="p-3 text-slate-400">GPU Perspective 1200px Spring</td>
                <td className="p-3 text-right tabular-nums text-emerald-400 font-bold">18,200/s</td>
                <td className="p-3 text-right tabular-nums text-emerald-400">&lt; 65ms</td>
                <td className="p-3 text-center text-emerald-400 font-bold">0.00%</td>
                <td className="p-3 text-center text-emerald-400">motion-reduce: rest</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-200">Var 4: Wiretap #arc</td>
                <td className="p-3 text-slate-400">Telemetry Ingest &amp; Live Diff</td>
                <td className="p-3 text-right tabular-nums text-emerald-400 font-bold">6,496/s core</td>
                <td className="p-3 text-right tabular-nums text-emerald-400">&lt; 0.31ms core</td>
                <td className="p-3 text-center text-emerald-400 font-bold">0.00%</td>
                <td className="p-3 text-center text-emerald-400">Interactive Map</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. COMPONENT CHERRY-PICKER TOOL */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-[#1F2937] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2937] pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Production Component Cherry-Picker</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Select which best-in-breed elements to combine into your organization's custom enterprise build.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {Object.values(selectedFeatures).filter(Boolean).length} of {featureList.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featureList.map((item) => {
            const isChecked = selectedFeatures[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleFeature(item.key)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? "bg-[#1E293B] border-blue-500 text-white shadow-md"
                    : "bg-[#0B0F19] border-[#1F2937] text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                    {item.source}
                  </span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isChecked
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <div className="text-xs font-medium font-sans">{item.label}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
