"use client";

import React from "react";
import { motion } from "framer-motion";

export const AmbientMotionBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Subtle Rectilinear Engineering Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(120, 140, 180, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 140, 180, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 2. Floating Breathing Radial Spotlights */}
      <motion.div
        className="absolute -top-[20%] left-[15%] w-[650px] h-[650px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[40%] -right-[10%] w-[550px] h-[550px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/12 blur-[140px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* 3. Ghost Statutory Watermarks Drifting in Space */}
      <motion.div
        aria-hidden="true"
        className="absolute top-[18%] right-[8%] font-mono font-black text-6xl select-none text-slate-900/[0.025] dark:text-white/[0.035] tracking-widest whitespace-nowrap"
        animate={{
          y: [0, -25, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        19 U.S.C. § 1592
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[22%] left-[4%] font-mono font-black text-7xl select-none text-slate-900/[0.02] dark:text-white/[0.03] tracking-widest whitespace-nowrap"
        animate={{
          y: [0, 30, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      >
        FMC DOCKET 21-08
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[8%] right-[20%] font-mono font-black text-6xl select-none text-slate-900/[0.02] dark:text-white/[0.025] tracking-widest whitespace-nowrap"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        19 CFR § 152.103
      </motion.div>
    </div>
  );
};
