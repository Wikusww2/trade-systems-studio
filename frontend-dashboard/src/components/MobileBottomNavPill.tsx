"use client";

import React from "react";
import { FileText, ShieldAlert } from "lucide-react";
import { sound } from "@/lib/audio";

interface MobileBottomNavPillProps {
  activeTab: "doc" | "findings";
  discrepancyCount: number;
  onSelectTab: (tab: "doc" | "findings") => void;
}

export const MobileBottomNavPill: React.FC<MobileBottomNavPillProps> = ({
  activeTab,
  discrepancyCount,
  onSelectTab,
}) => {
  return (
    <nav
      aria-label="Mobile View Switcher"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 lg:hidden"
    >
      <div className="flex items-center gap-1 p-1 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full shadow-2xl shadow-black/60 font-mono text-xs">
        {/* Document Tab */}
        <button
          type="button"
          onClick={() => {
            sound.playTick();
            onSelectTab("doc");
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === "doc"
              ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Document</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "doc"
                ? "bg-white/20 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            PDF
          </span>
        </button>

        {/* Report / Findings Tab */}
        <button
          type="button"
          onClick={() => {
            sound.playTick();
            onSelectTab("findings");
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === "findings"
              ? "bg-red-600 text-white font-semibold shadow-md shadow-red-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report</span>
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
    </nav>
  );
};
