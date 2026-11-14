"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/audio";

interface DocumentScannerBeamProps {
  isScanning: boolean;
  onScanComplete?: () => void;
}

export const DocumentScannerBeam: React.FC<DocumentScannerBeamProps> = ({
  isScanning,
  onScanComplete,
}) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isScanning) {
      setAnimating(true);
      sound.playScanSweep();
      const timer = setTimeout(() => {
        setAnimating(false);
        sound.playLock();
        if (onScanComplete) onScanComplete();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [isScanning, onScanComplete]);

  if (!animating) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Luminous Laser Sweepline */}
      <div 
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.9),0_0_30px_rgba(6,182,212,0.6)] animate-scan-beam"
      />

      {/* 2. Cyan Scanning Aura Gradient */}
      <div 
        className="absolute left-0 right-0 h-24 bg-gradient-to-b from-cyan-500/15 to-transparent pointer-events-none animate-scan-beam"
      />

      {/* 3. High-Precision HUD Crosshairs Overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[10px] text-cyan-400 tracking-wider bg-slate-950/80 px-2.5 py-1 border border-cyan-500/40 rounded-xs shadow-md backdrop-blur-xs">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>DOCLING OCR KERNEL ACTIVE • SCANNING COORDINATES</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 font-mono text-[9px] text-cyan-300/80 bg-slate-950/80 px-2 py-0.5 border border-cyan-500/30 rounded-xs">
        <span>GRI 1-6 PARSER: RUNNING</span>
      </div>
    </div>
  );
};
