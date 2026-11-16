"use client";

import React, { useEffect } from "react";
import { Layout, ListOrdered, Sparkles, Terminal, Layers } from "lucide-react";
import { playPseudoHaptic } from "@/lib/firewall-core";

export type ParadigmId = "var-1" | "var-2" | "var-3" | "var-4" | "synthesis";

interface ParadigmSwitcherProps {
  activeParadigm: ParadigmId;
  onChange: (paradigm: ParadigmId) => void;
}

const PARADIGMS: { id: ParadigmId; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: "var-1", label: "Workbench", shortcut: "⌘1", icon: <Layout className="w-3.5 h-3.5" /> },
  { id: "var-2", label: "Triage Desk", shortcut: "⌘2", icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { id: "var-3", label: "Kinetic 3D", shortcut: "⌘3", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "var-4", label: "Wiretap #arc", shortcut: "⌘4", icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: "synthesis", label: "Synthesis", shortcut: "⌘5", icon: <Layers className="w-3.5 h-3.5" /> },
];

export const ParadigmSwitcher: React.FC<ParadigmSwitcherProps> = ({
  activeParadigm,
  onChange,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          playPseudoHaptic();
          onChange("var-1");
        } else if (e.key === "2") {
          e.preventDefault();
          playPseudoHaptic();
          onChange("var-2");
        } else if (e.key === "3") {
          e.preventDefault();
          playPseudoHaptic();
          onChange("var-3");
        } else if (e.key === "4") {
          e.preventDefault();
          playPseudoHaptic();
          onChange("var-4");
        } else if (e.key === "5") {
          e.preventDefault();
          playPseudoHaptic();
          onChange("synthesis");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F172A]/90 border border-[#1F2937] backdrop-blur-md shadow-2xl">
      <span className="text-[10px] font-mono text-slate-400 px-2 uppercase tracking-widest hidden md:inline-block">
        PARADIGM:
      </span>
      {PARADIGMS.map((p) => {
        const isActive = activeParadigm === p.id;
        return (
          <button
            key={p.id}
            onClick={() => {
              playPseudoHaptic();
              onChange(p.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 active:scale-[0.97] ${
              isActive
                ? "bg-blue-600 text-white font-semibold shadow-sm border border-blue-400/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60"
            }`}
            title={`Switch to ${p.label} (${p.shortcut})`}
          >
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded border ml-0.5 ${
                isActive
                  ? "bg-blue-700/80 border-blue-400/40 text-blue-100"
                  : "bg-[#1E293B] border-[#334155] text-slate-400"
              }`}
            >
              {p.shortcut}
            </span>
          </button>
        );
      })}
    </div>
  );
};
