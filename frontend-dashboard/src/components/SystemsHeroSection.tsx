"use client";

import React from "react";
import { Zap, Cpu, CheckCircle2 } from "lucide-react";
import { IcpPersonaSwitcher, IcpPersona } from "./IcpPersonaSwitcher";
import { VERIFIED_PYTEST_COUNT } from "@/lib/metrics";

interface SystemsHeroSectionProps {
  persona: IcpPersona;
  onChangePersona: (p: IcpPersona) => void;
}

export const SystemsHeroSection: React.FC<SystemsHeroSectionProps> = ({
  persona,
  onChangePersona,
}) => {
  return (
    <section className="border-b border-terminal-subtle bg-terminal-slate/40 py-8 lg:py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Verification + Executive Lens */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 type-mono-data">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cobalt-950/80 border border-cobalt-800 text-cobalt-300 rounded-md font-medium">
                <Zap className="w-3.5 h-3.5 text-ink-cobalt" />
                <span>Deterministic Pre-Ingest Firewall</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-terminal-elevated border border-terminal-subtle text-ink-secondary rounded-md">
                <Cpu className="w-3.5 h-3.5 text-ink-emerald" />
                <span>CargoWise UniversalShipment XML &amp; ACE Ready</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-terminal-elevated border border-terminal-subtle text-ink-secondary rounded-md tabular-nums">
                <CheckCircle2 className="w-3.5 h-3.5 text-ink-emerald" />
                <span>{`${VERIFIED_PYTEST_COUNT}/${VERIFIED_PYTEST_COUNT} Automated Tests Passing`}</span>
              </span>
            </div>

            <IcpPersonaSwitcher persona={persona} onChange={onChangePersona} />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink-primary tracking-[-0.025em] leading-[1.15] text-balance mb-4">
            Deterministic Pre-Ingest Verification for{" "}
            <span className="text-ink-cobalt">CargoWise &amp; ACE</span>
          </h1>

          <p className="type-body-default sm:text-base text-ink-secondary leading-relaxed mb-6 font-normal">
            Intercepting <span className="statutory-cite">19 U.S.C. § 1592</span> customs penalties, carrier accessorial overbilling, and GRI misclassifications before UniversalShipment XML enters your TMS. Built with sub-millisecond statutory core execution, zero floating-point drift, and 100% Python Decimal precision.
          </p>

          {/* Executive Lens Takeaway */}
          <div className="mb-6 pl-3 border-l-2 border-cobalt-600">
            <div className="type-caption-mono uppercase text-ink-cobalt font-medium mb-1">
              {persona === "cfo"
                ? "CFO / EBITDA lens"
                : persona === "counsel"
                ? "General Counsel lens"
                : "CTO / Platform lens"}
            </div>
            <p className="type-body-default text-ink-secondary max-w-2xl">
              {persona === "cfo"
                ? "Cash leaks at the carrier invoice and the duty payment. Both are intercepted here before the wire releases: 5% to 15% of freight spend is recoverable billing error, not cost of doing business."
                : persona === "counsel"
                ? "Every finding cites its statute and carries a contestable provenance record. 19 U.S.C. § 1592 negligence exposure runs 0.25x to 4.0x lawful duty loss (quantified from the entry, not estimated)."
                : `No external API in the critical path. Deterministic fallback keeps the engine live offline, ${VERIFIED_PYTEST_COUNT}/${VERIFIED_PYTEST_COUNT} pytest tests verify the kernel, and Python Decimal eliminates floating-point drift in every statutory figure.`}
            </p>
          </div>

          {/* Systems Metrics Strip: documented benchmarks only */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-terminal-subtle">
            <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
              <div className="type-caption-mono uppercase text-ink-muted">
                Core Throughput
              </div>
              <div className="text-base sm:text-lg font-mono font-semibold text-ink-cobalt tabular-nums">
                6,496 /sec
              </div>
              <div className="type-caption-mono text-ink-muted">Statutory core evals</div>
            </div>

            <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
              <div className="type-caption-mono uppercase text-ink-muted">
                p99 Latency
              </div>
              <div className="text-base sm:text-lg font-mono font-semibold text-ink-cobalt tabular-nums">
                0.303 ms
              </div>
              <div className="type-caption-mono text-ink-muted">Core (58.8ms 2p PDF)</div>
            </div>

            <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
              <div className="type-caption-mono uppercase text-ink-muted">
                Arithmetic Standard
              </div>
              <div className="text-base sm:text-lg font-mono font-semibold text-ink-emerald tabular-nums">
                100% Decimal
              </div>
              <div className="type-caption-mono text-ink-muted">Zero LLM Calculations</div>
            </div>

            <div className="p-3 bg-terminal-slate border border-terminal-subtle rounded-lg">
              <div className="type-caption-mono uppercase text-ink-muted">
                Carrier Leakage Intercept
              </div>
              <div className="text-base sm:text-lg font-mono font-semibold text-ink-crimson tabular-nums">
                5% to 15%
              </div>
              <div className="type-caption-mono text-ink-muted">Pre-Payment Guard</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
