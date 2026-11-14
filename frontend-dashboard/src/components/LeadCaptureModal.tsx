"use client";

import React, { useState } from "react";
import { submitLeadCapture, recordTelemetry } from "@/lib/supabase";
import { X, CheckCircle2, Shield, ArrowRight, Loader2 } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConceptId: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  activeConceptId,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [volume, setVolume] = useState("500-2500 documents/mo");
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
      metadata: { name, company: companyName, volume },
    });

    const res = await submitLeadCapture({
      email,
      company_name: companyName,
      phone,
      monthly_import_volume: `${volume} [Contact: ${name}]`,
      source: "technical_architecture_review_modal",
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setLeadId(res.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1F2937] p-6 sm:p-7 shadow-2xl rounded-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-cobalt-50 dark:bg-cobalt-950/80 border border-cobalt-200 dark:border-cobalt-800 text-cobalt-700 dark:text-cobalt-400 font-semibold rounded-xs">
                Technical Architecture Review
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Samuel | TradeTech Systems Studio
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Schedule a Technical Architecture Review
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
              A working session on the audit engine, provenance model, and integration surface, led by the engineer who built it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#1F2937] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cobalt-600 dark:focus:border-cobalt-400 font-mono rounded-sm"
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
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#1F2937] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cobalt-600 dark:focus:border-cobalt-400 font-mono rounded-sm"
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
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#1F2937] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cobalt-600 dark:focus:border-cobalt-400 font-mono rounded-sm"
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
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#1F2937] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cobalt-600 dark:focus:border-cobalt-400 font-mono rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Document Volume (bills, entries, XML shipments)
                </label>
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#1F2937] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cobalt-600 dark:focus:border-cobalt-400 font-mono rounded-sm"
                >
                  <option value="&lt;500 documents/mo">&lt; 500 documents per month</option>
                  <option value="500-2500 documents/mo">500 - 2,500 documents per month</option>
                  <option value="2500-10000 documents/mo">2,500 - 10,000 documents per month</option>
                  <option value="10000+ documents/mo">10,000+ documents per month (Enterprise)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-cobalt-600 hover:bg-cobalt-500 dark:bg-cobalt-500 dark:hover:bg-cobalt-400 text-white dark:text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 rounded-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Review Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Architecture Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] font-mono text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cobalt-600 dark:text-cobalt-400" />
                  <span>NDA on Request · Zero Data Retention</span>
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
              Review Request Logged
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-sm mx-auto">
              Your request has been logged. Samuel will review your document volume profile and reach out within 4 business hours to schedule the working session.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1F2937] text-left text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 mb-5 rounded-sm">
              <div className="flex justify-between">
                <span>Reference ID:</span>
                <span className="text-cobalt-600 dark:text-cobalt-400 font-semibold">{leadId}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Lead:</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">Samuel | Principal Architect</span>
              </div>
              <div className="flex justify-between">
                <span>Response Window:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">4 Business Hours</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-xs font-mono text-white dark:text-slate-200 border border-slate-700 dark:border-[#334155] transition-colors rounded-sm"
            >
              Return to Workbench
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
