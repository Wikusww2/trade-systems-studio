"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  Play,
  RotateCcw
} from "lucide-react";
import { sound } from "@/lib/audio";

interface TourStep {
  id: string;
  targetId?: string;
  title: string;
  badge: string;
  description: string;
  statute: string;
  actionHint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "step-1",
    targetId: "audit-workspace",
    title: "Multi-Pillar Trade Intelligence",
    badge: "01 / ARCHITECTURE",
    description: "Toggle seamlessly across 6 enterprise compliance engines: Customs § 1592 Defense, Pre-Payment Freight Audit, Duty Drawback, OFAC 50% Sanctions Graph, HTS Copilot, and GAAP Assist Registers.",
    statute: "WCO GRI 1–6 • 19 U.S.C. § 1592 • 31 CFR § 501",
    actionHint: "Click any tab in the top switcher to activate that diagnostic lens.",
  },
  {
    id: "step-2",
    targetId: "audit-workspace",
    title: "Normalized Coordinate Space [0, 1000)",
    badge: "02 / ZERO-BUDGET OCR",
    description: "Powered by local Docling layout parsing with zero cloud OCR fees. Bounding boxes are mathematically normalized so highlights stay locked onto canvas text regardless of display zoom or device scale.",
    statute: "Formula: left = x_norm × scale × (W_base / 1000)",
    actionHint: "Inspect the rendered PDF on the left; highlights stay aligned across zoom levels.",
  },
  {
    id: "step-3",
    targetId: "audit-workspace",
    title: "Interactive Discrepancy & Statutory Gating",
    badge: "03 / STATUTORY REASONING",
    description: "Hovering over any finding card smoothly animates and highlights the exact source text on the PDF. Extractions with confidence < 0.85 render with dashed amber borders to cue human broker review.",
    statute: "Element-Wise Confidence Gating (Conf(e) < 0.85)",
    actionHint: "Hover over discrepancy cards to see synchronized canvas bounding box illumination.",
  },
  {
    id: "step-4",
    targetId: "audit-workspace",
    title: "3-Way Document Fixture Switcher",
    badge: "04 / PRE-CLEARANCE AUDIT",
    description: "Experience both sides of the coin: test 'Corrupted Nightmare Mode' to intercept $24k in penalties, switch to 'Clean Production Mode' for 100% Pre-Clearance certification, or drop your own PDF for an on-device audit.",
    statute: "100% On-Device Client Audit (Zero Cloud Byte Leakage)",
    actionHint: "Use the top mode pills to test Nightmare vs Clean FOB vs Client Upload.",
  },
  {
    id: "step-5",
    targetId: "audit-workspace",
    title: "Verifiable Proof: 41/41 Tests & API Playground",
    badge: "05 / PRODUCTION RIGOR",
    description: "Every financial and customs formula is backed by 100% Python Decimal precision. Inspect 41 passing Pytest suites, review 33k audits/sec benchmarks, and simulate live REST requests in the API Playground.",
    statute: "33,496 audits/sec • p99 < 0.09 ms • Zero Floating-Point Drift",
    actionHint: "Click 'Architecture & Tests' in the header to run live API simulations and view recruiter defenses.",
  },
];

interface ExecutiveTourOverlayProps {
  isActive: boolean;
  onClose: () => void;
  onOpenArchitectureModal: () => void;
}

export const ExecutiveTourOverlay: React.FC<ExecutiveTourOverlayProps> = ({
  isActive,
  onClose,
  onOpenArchitectureModal,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  useEffect(() => {
    if (isActive) {
      setCurrentStepIdx(0);
      sound.playSuccess();
    }
  }, [isActive]);

  if (!isActive) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  const handleNext = () => {
    sound.playTick();
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playTick();
    if (!isFirst) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto w-full max-w-xl bg-[#14171E] text-[#E2E8F0] border-2 border-cyan-500/60 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col font-mono"
      >
        {/* Tour Header */}
        <div className="p-4 bg-[#1A1D24] border-b border-[#2A2F3A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              60-Second Executive Walkthrough
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-300 font-semibold">
              Step {currentStepIdx + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tour Body */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
              {currentStep.badge}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              {currentStep.statute}
            </span>
          </div>

          <h3 className="text-base font-bold text-white font-sans">
            {currentStep.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          <div className="p-2.5 rounded bg-[#0E1015] border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{currentStep.actionHint}</span>
          </div>
        </div>

        {/* Tour Footer / Action Bar */}
        <div className="p-3.5 bg-[#161920] border-t border-[#2A2F3A] flex items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playTick();
                  setCurrentStepIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? "w-6 bg-cyan-400"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded bg-[#1A1D24] hover:bg-slate-800 text-slate-300 text-xs border border-[#2A2F3A] transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {isLast ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playTick();
                    onClose();
                    onOpenArchitectureModal();
                  }}
                  className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40"
                >
                  Open Architecture Proof
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Finish
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-cyan-950/40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
