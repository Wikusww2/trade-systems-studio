"use client";

import React from "react";
import { Briefcase, Cpu, Scale } from "lucide-react";
import { sound } from "@/lib/audio";

export type IcpPersona = "cfo" | "counsel" | "cto";

interface IcpPersonaSwitcherProps {
  persona: IcpPersona;
  onChange: (persona: IcpPersona) => void;
}

const LENSES: Array<{ id: IcpPersona; label: string; icon: React.ReactNode }> = [
  { id: "cfo", label: "CFO / EBITDA", icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: "counsel", label: "General Counsel", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "cto", label: "CTO / Platform", icon: <Cpu className="w-3.5 h-3.5" /> },
];

export const IcpPersonaSwitcher: React.FC<IcpPersonaSwitcherProps> = ({
  persona,
  onChange,
}) => {
  const handleSwitch = (newPersona: IcpPersona) => {
    sound.playTick();
    onChange(newPersona);
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0F172A] border border-[#1F2937] rounded-lg font-mono text-xs">
      <span className="text-[10px] text-slate-500 uppercase px-2 font-semibold hidden md:inline">
        Executive Lens:
      </span>

      {LENSES.map((lens) => {
        const isActive = persona === lens.id;
        return (
          <button
            key={lens.id}
            onClick={() => handleSwitch(lens.id)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-md font-bold text-[11px] uppercase tracking-wider transition-colors duration-200 ${
              isActive
                ? "bg-cobalt-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
            }`}
          >
            {lens.icon}
            <span>{lens.label}</span>
          </button>
        );
      })}
    </div>
  );
};
