"use client";

import React from "react";
import { Briefcase, Scale, Sparkles } from "lucide-react";
import { sound } from "@/lib/audio";

export type IcpPersona = "cfo" | "counsel";

interface IcpPersonaSwitcherProps {
  persona: IcpPersona;
  onChange: (persona: IcpPersona) => void;
}

export const IcpPersonaSwitcher: React.FC<IcpPersonaSwitcherProps> = ({
  persona,
  onChange,
}) => {
  const handleSwitch = (newPersona: IcpPersona) => {
    sound.playTick();
    onChange(newPersona);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-200/80 dark:bg-[#1E2533] border border-slate-300 dark:border-[#2D3545] rounded-sm font-mono text-xs shadow-inner">
      <span className="text-[10px] text-slate-500 uppercase px-2 font-semibold hidden md:inline">
        Executive Lens:
      </span>

      <button
        onClick={() => handleSwitch("cfo")}
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xs font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
          persona === "cfo"
            ? "bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
        <span>CFO / EBITDA Lens</span>
      </button>

      <button
        onClick={() => handleSwitch("counsel")}
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xs font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
          persona === "counsel"
            ? "bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
        <span>General Counsel Lens</span>
      </button>
    </div>
  );
};
