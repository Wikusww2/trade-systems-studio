"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldAlert } from "lucide-react";
import { sound } from "@/lib/audio";

interface MobileBottomNavPillProps {
  activeTab: "doc" | "findings";
  discrepancyCount: number;
  isVisible: boolean;
  onSelectTab: (tab: "doc" | "findings") => void;
}

export const MobileBottomNavPill: React.FC<MobileBottomNavPillProps> = ({
  activeTab,
  discrepancyCount,
  isVisible,
  onSelectTab,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          key="contextual-workbench-pill"
          aria-label="Document and Report View Switcher"
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.94 }}
          transition={{
            type: "spring",
            stiffness: 340,
            damping: 28,
            mass: 0.85,
          }}
          className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none px-4"
        >
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-[#090D16]/90 backdrop-blur-2xl border border-white/12 rounded-full shadow-[0_16px_48px_rgba(0,0,0,0.8)] font-mono text-xs ring-1 ring-white/5">
            {/* Document Tab Button */}
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onSelectTab("doc");
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-[0.96] ${
                activeTab === "doc"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="tracking-tight">Document</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "doc"
                    ? "bg-white/20 text-white"
                    : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                }`}
              >
                PDF
              </span>
            </button>

            {/* Report / Findings Tab Button */}
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onSelectTab("findings");
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-[0.96] ${
                activeTab === "findings"
                  ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-600/30 ring-1 ring-red-400/40"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="tracking-tight">Report</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  activeTab === "findings"
                    ? "bg-white/20 text-white"
                    : "bg-red-950/80 text-red-400 border border-red-800/60"
                }`}
              >
                {discrepancyCount}
              </span>
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
