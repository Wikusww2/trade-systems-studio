"use client";

import React, { useState } from "react";
import { submitLeadCapture, recordTelemetry } from "@/lib/supabase";
import { X, CheckCircle2, Shield, ArrowRight, Loader2, Calendar, FileText, Check } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConceptId: string;
  initialServiceTier?: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  activeConceptId,
  initialServiceTier,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceTier, setServiceTier] = useState(
    initialServiceTier || "contingent_audit"
  );
  const [volume, setVolume] = useState("50-250 containers/mo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leadId, setLeadId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !companyName) return;

    setIsSubmitting(true);
    recordTelemetry({
      event_type: "lead_submitted",
      concept_id: activeConceptId,
      metadata: { name, company: companyName, service_tier: serviceTier, volume },
    });

    const res = await submitLeadCapture({
      email,
      company_name: companyName,
      phone,
      monthly_import_volume: `${volume} [Tier: ${serviceTier}] [Contact: ${name}]`,
      source: "samuel_executive_advisory_modal",
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setLeadId(res.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#2D333F] p-6 sm:p-7 shadow-2xl rounded-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-[#2D333F] hover:bg-slate-100 dark:hover:bg-[#202530] rounded-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 font-semibold rounded-xs">
                Direct Principal Engagement
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Samuel | TradeTech Systems Studio
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Engage Samuel for Trade Compliance & Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
              Select an engagement path below. Samuel personally reviews every diagnostic audit and architecture blueprint.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Engagement Path Picker */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Engagement Path
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceTier("contingent_audit")}
                    className={`p-2.5 text-left border rounded-sm transition-all text-xs ${
                      serviceTier === "contingent_audit"
                        ? "bg-sky-50 dark:bg-[#1E2533] border-sky-600 dark:border-sky-400 text-slate-950 dark:text-white ring-1 ring-sky-500"
                        : "bg-slate-50 dark:bg-[#0E1015] border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-200">25-Doc Audit</div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 font-bold">$0 Upfront</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceTier("custom_pipeline")}
                    className={`p-2.5 text-left border rounded-sm transition-all text-xs ${
                      serviceTier === "custom_pipeline"
                        ? "bg-sky-50 dark:bg-[#1E2533] border-sky-600 dark:border-sky-400 text-slate-950 dark:text-white ring-1 ring-sky-500"
                        : "bg-slate-50 dark:bg-[#0E1015] border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-200">Custom Engine</div>
                    <div className="text-[10px] text-sky-700 dark:text-sky-400 font-mono mt-0.5 font-bold">ERP Pipeline</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceTier("fractional_advisory")}
                    className={`p-2.5 text-left border rounded-sm transition-all text-xs ${
                      serviceTier === "fractional_advisory"
                        ? "bg-sky-50 dark:bg-[#1E2533] border-sky-600 dark:border-sky-400 text-slate-950 dark:text-white ring-1 ring-sky-500"
                        : "bg-slate-50 dark:bg-[#0E1015] border-slate-200 dark:border-[#262B35] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-200">Strategy Call</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono mt-0.5 font-bold">30-Min Brief</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe, VP Supply Chain"
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#2D333F] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 font-mono rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@enterprise.com"
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#2D333F] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 font-mono rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company / Importer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Apex Global Logistics"
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#2D333F] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 font-mono rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Direct Phone / Cell
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#2D333F] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 font-mono rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Monthly Import Volume / Freight Spend
                </label>
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-[#2D333F] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 font-mono rounded-sm"
                >
                  <option value="10-50 containers/mo">&lt; 50 containers / &lt; $500k annual freight</option>
                  <option value="50-250 containers/mo">50 - 250 containers / $500k - $3M annual freight</option>
                  <option value="250-1000 containers/mo">250 - 1,000 containers / $3M - $10M annual freight</option>
                  <option value="1000+ containers/mo">1,000+ containers / $10M+ Enterprise spend</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 rounded-sm shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Executive Brief...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Brief Directly to Samuel</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] font-mono text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Strict NDA & Attorney-Client Protected</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Zero Cloud OCR Retention</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              Executive Brief Transmitted to Samuel
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-sm mx-auto">
              Your engagement request has been logged. Samuel will personally review your trade volume profile and reach out within 4 business hours with your secure intake link.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#262B35] text-left text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 mb-5 rounded-sm">
              <div className="flex justify-between">
                <span>Engagement ID:</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{leadId}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Contact:</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">Samuel | Principal Architect</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Executive Fast-Track</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#202530] dark:hover:bg-[#2B3240] text-xs font-mono text-white dark:text-slate-200 border border-slate-700 dark:border-[#3A4252] transition-colors rounded-sm"
            >
              Return to Diagnostic Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
