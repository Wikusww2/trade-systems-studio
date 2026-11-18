"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ArrowRight, Menu, X, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import { ParadigmSwitcher, ParadigmId } from "./ParadigmSwitcher";
import { sound } from "@/lib/audio";

interface WorkbenchHeaderProps {
  activeParadigm: ParadigmId;
  onParadigmChange: (p: ParadigmId) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  onOpenArchitecture: () => void;
  onOpenReview: () => void;
}

export const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({
  activeParadigm,
  onParadigmChange,
  isMobileNavOpen,
  setIsMobileNavOpen,
  onOpenArchitecture,
  onOpenReview,
}) => {
  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  useEffect(() => {
    setAudioMuted(sound.getMuted());
    if (typeof document !== "undefined") {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = sound.toggleMute();
    setAudioMuted(nextMuted);
    if (!nextMuted) {
      sound.playTick();
    }
  };

  const handleToggleTheme = () => {
    sound.playTick();
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    if (nextDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setIsDarkTheme(nextDark);
    try {
      localStorage.setItem("tradetech_theme", nextDark ? "dark" : "light");
    } catch {
      // Storage unavailable
    }
  };

  return (
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
                Available for Principal Systems &amp; Forward-Deployed AI
              </span>
            </div>
          </div>
        </div>

        {/* 2-Way Paradigm Switcher (⌘1-⌘2) */}
        <div className="hidden sm:flex items-center">
          <ParadigmSwitcher activeParadigm={activeParadigm} onChange={onParadigmChange} />
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Opt-in Audio Haptics Toggle (Muted by Default - WCAG / M10) */}
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label={audioMuted ? "Enable audio haptics" : "Mute audio haptics"}
            aria-pressed={!audioMuted}
            title={audioMuted ? "Enable Audio Haptics (Muted)" : "Mute Audio Haptics"}
            className="p-1.5 border border-slate-700/80 hover:border-slate-500 bg-terminal-elevated/40 hover:bg-terminal-elevated text-ink-secondary hover:text-ink-primary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-ink-emerald" />}
          </button>

          {/* Accessible Theme Toggle (Dark / Light - M10) */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={!isDarkTheme}
            title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 border border-slate-700/80 hover:border-slate-500 bg-terminal-elevated/40 hover:bg-terminal-elevated text-ink-secondary hover:text-ink-primary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
          >
            {isDarkTheme ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-ink-cobalt" />}
          </button>

          <button
            onClick={onOpenArchitecture}
            aria-label="Open Architecture and Executive Dossier"
            className="px-2.5 sm:px-3 py-1.5 border border-slate-700/80 hover:border-slate-500 bg-terminal-elevated/40 hover:bg-terminal-elevated text-ink-secondary hover:text-ink-primary type-mono-data rounded-md transition-colors flex items-center gap-1.5"
            title="Open Architecture & Executive Dossier"
          >
            <Terminal className="w-3.5 h-3.5 text-ink-cobalt" />
            <span className="hidden md:inline">Architecture &amp; Dossier</span>
          </button>

          <button
            onClick={onOpenReview}
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
            aria-expanded={isMobileNavOpen}
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
            <ParadigmSwitcher activeParadigm={activeParadigm} onChange={onParadigmChange} showLabel={false} />
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
            onClick={onOpenReview}
            className="w-full mt-2 py-2 px-3 bg-cobalt-600 text-canvas-stone font-semibold text-xs uppercase tracking-wider rounded-md text-center"
          >
            Schedule Architecture Review
          </button>
        </div>
      )}
    </header>
  );
};
