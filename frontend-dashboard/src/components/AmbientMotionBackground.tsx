"use client";

import React from "react";

export const AmbientMotionBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle, Static Architectural Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(#F8FAFC 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
};
