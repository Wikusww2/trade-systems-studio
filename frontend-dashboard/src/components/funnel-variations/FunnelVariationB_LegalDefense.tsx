"use client";

import React, { useState } from "react";
import {
  Scale,
  Shield,
  AlertOctagon,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Building,
  Mail,
  Sliders,
  ChevronRight,
  Gavel,
  BookOpen,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { submitLeadCapture, recordTelemetry } from "@/lib/supabase";

interface FunnelVariationBProps {
  onClose?: () => void;
}

export const FunnelVariationB_LegalDefense: React.FC<FunnelVariationBProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [dutyLoss, setDutyLoss] = useState<number>(6000);
  const [domesticValue, setDomesticValue] = useState<number>(125000);
  const [showPriorDisclosureDoc, setShowPriorDisclosureDoc] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [counselEmail, setCounselEmail] = useState("");
  const [counselName, setCounselName] = useState("");
  const [annualImportValue, setAnnualImportValue] = useState("$20M – $50M USD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Statutory Calculations (19 U.S.C. § 1592)
  const negligenceMin = dutyLoss * 0.25;
  const negligenceMax = dutyLoss * 2.0;
  const grossNegligenceMax = dutyLoss * 4.0;
  const fraudPenalty = domesticValue;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselEmail || !companyName) return;

    setIsSubmitting(true);
    sound.playLock();

    await submitLeadCapture({
      email: counselEmail,
      company_name: companyName,
      phone: "",
      monthly_import_volume: `[Counsel Funnel Variation B] Dutiable Value: ${annualImportValue} • Lead: ${counselName}`,
      source: "general_counsel_1592_defense_funnel",
    });

    recordTelemetry({
      event_type: "lead_submitted",
      concept_id: "funnel_variation_b_counsel",
      metadata: { companyName, counselEmail, annualImportValue },
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setActiveStep(3);
  };

  return (
    <div className="w-full bg-[#0E1015] text-[#E2E8F0] border border-[#262B35] rounded-sm shadow-2xl overflow-hidden font-sans">
      {/* Top Defense Banner */}
      <div className="bg-[#14171E] border-b border-[#262B35] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-400 font-semibold rounded-xs">
              DEFENSIVE STATUTORY SAFE-HARBOR
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              For General Counsel & VP of Global Trade Compliance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            19 U.S.C. § 1592 Penalty Firewall & Prior Disclosure Safe-Harbor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict liability governance: Importers bear non-delegable legal liability for broker transcription errors and assist omissions.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 1
                ? "bg-rose-950/80 border-rose-400 text-rose-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            1. Statutory Exposure
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            onClick={() => setActiveStep(2)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 2
                ? "bg-rose-950/80 border-rose-400 text-rose-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            2. Safe-Harbor Prior Disclosure
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            onClick={() => setActiveStep(3)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 3
                ? "bg-rose-950/80 border-rose-400 text-rose-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            3. Privileged Audit
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Regulatory Exposure Slider */}
            <div className="p-5 bg-[#14171E] border border-[#262B35] rounded-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262B35] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-rose-400" />
                    <span>19 U.S.C. § 1592 Civil Monetary Penalty Exposure Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Model your company&apos;s statutory exposure based on single or cumulative entry duty loss:
                  </p>
                </div>
                <div className="font-mono text-xs text-slate-400">
                  Calculated Under: <span className="text-white font-semibold">19 CFR Part 171 App. B</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Underpaid Duty / Tariff Shortfall:</span>
                    <span className="text-rose-400 font-bold">${dutyLoss.toLocaleString("en-US")} USD</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={dutyLoss}
                    onChange={(e) => setDutyLoss(Number(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>$1,000 (Single Entry)</span>
                    <span>$25,000</span>
                    <span>$50,000 (Batch Entries)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Domestic Merchandise Value:</span>
                    <span className="text-white font-bold">${domesticValue.toLocaleString("en-US")} USD</span>
                  </div>
                  <input
                    type="range"
                    min="25000"
                    max="500000"
                    step="5000"
                    value={domesticValue}
                    onChange={(e) => setDomesticValue(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>$25,000</span>
                    <span>$250,000</span>
                    <span>$500,000</span>
                  </div>
                </div>
              </div>

              {/* The Penalty Escalation Ladder */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#0B0D11] border border-[#262B35] rounded-xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Negligence (0.25x – 2.0x)</div>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                    ${negligenceMin.toLocaleString("en-US")} – ${negligenceMax.toLocaleString("en-US")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Failure to exercise reasonable care</div>
                </div>

                <div className="p-3 bg-[#0B0D11] border border-[#262B35] rounded-xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Gross Negligence (2.5x – 4.0x)</div>
                  <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                    ${(dutyLoss * 2.5).toLocaleString("en-US")} – ${grossNegligenceMax.toLocaleString("en-US")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Wanton disregard of customs facts</div>
                </div>

                <div className="p-3 bg-[#0B0D11] border border-[#262B35] rounded-xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Fraud (Domestic Value)</div>
                  <div className="text-lg font-bold font-mono text-rose-500 mt-0.5">
                    ${fraudPenalty.toLocaleString("en-US")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100% of dutiable merchandise value</div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xs">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Prior Disclosure Safe Harbor</div>
                  <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                    $0.00 Penalty
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-1">19 CFR § 162.74 statutory immunity</div>
                </div>
              </div>
            </div>

            {/* Next Action Callout */}
            <div className="p-4 bg-[#14171E] border border-slate-700 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  How Prior Disclosure Inoculates Your Executive Team
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  Under 19 CFR § 162.74, if an importer tenders back-duties and supporting documentation before CBP commences a formal investigation, the statutory monetary penalty is reduced to <strong>zero</strong>.
                </p>
              </div>

              <button
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <span>Inspect Safe-Harbor Prior Disclosure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Safe-Harbor Prior Disclosure Document Generator */}
            <div className="p-5 bg-[#14171E] border border-[#262B35] rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#262B35] pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-white font-mono uppercase">
                    Automated 19 CFR § 162.74 Prior Disclosure Package
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-semibold rounded-xs">
                  PENALTY EXPOSURE MITIGATED TO $0
                </span>
              </div>

              {/* Legal Letter Preview */}
              <div className="p-5 bg-[#0B0D11] border border-slate-800 rounded-xs font-mono text-xs text-slate-300 space-y-3 leading-relaxed">
                <div className="border-b border-slate-800 pb-2 text-slate-500 text-[11px]">
                  CONFIDENTIAL • ATTORNEY-CLIENT PRIVILEGED WORK PRODUCT • 19 CFR § 162.74 SUBMISSION
                </div>
                <p><strong>TO:</strong> Office of the Port Director, U.S. Customs and Border Protection</p>
                <p><strong>FROM:</strong> Corporate Counsel on behalf of Importer of Record</p>
                <p><strong>SUBJECT:</strong> Voluntary Prior Disclosure of Customs Valuation Assist & Tariff Subheading Classification Discrepancy</p>
                <p className="text-slate-400">
                  Pursuant to 19 U.S.C. § 1592(c)(4) and 19 CFR § 162.74, notice is hereby given of a voluntary disclosure concerning commercial entries transacted over the preceding 24 months.
                </p>
                <div className="p-3 bg-[#11141A] border border-slate-800 rounded-xs space-y-1.5 text-[11px] text-slate-300">
                  <p>• <strong>Finding 1 (19 CFR § 152.103 Valuation Assist):</strong> Engineering and design tooling incurred in the amount of $45,000.00 was inadvertently omitted from transaction value on Commercial Invoice SSAC-2024-89912.</p>
                  <p>• <strong>Finding 2 (WCO GRI 1 & 6 HTS Subheading):</strong> Semiconductor test assemblies entered under subheading 8473.30.1180 (0% duty) are properly classified under 8542.31.0001 subject to Section 301 duties.</p>
                  <p className="text-emerald-400 font-bold">• <strong>Tender of Lawful Duty Loss:</strong> $6,000.00 tendered herewith, completely capping civil penalty liability under 19 U.S.C. § 1592(c)(4) at ZERO ($0.00).</p>
                </div>
                <p className="text-slate-400">
                  This disclosure is made prior to the commencement of any formal investigation as defined under 19 CFR § 162.74(g).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  Attorney-Client Privilege Preserved • Valid Across All U.S. Ports of Entry
                </span>
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Authorize Privileged 25-Entry Diagnostic ($0)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!isSubmitted ? (
              <div className="bg-[#14171E] border border-[#262B35] p-6 rounded-sm">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-400 font-bold rounded-xs">
                    PRIVILEGED & MUTUAL NDA PROTECTED
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    Request Privileged Customs Compliance Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    $0 Upfront. Samuel executes a blind diagnostic audit of 25 historical CBP Form 7501s, commercial invoices, and tariff subheadings to surface latent 1592 liabilities.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Counsel / Executive Name *</label>
                      <input
                        type="text"
                        required
                        value={counselName}
                        onChange={(e) => setCounselName(e.target.value)}
                        placeholder="e.g. David Vance, General Counsel"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-rose-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Work Email (Confidential) *</label>
                      <input
                        type="email"
                        required
                        value={counselEmail}
                        onChange={(e) => setCounselEmail(e.target.value)}
                        placeholder="dvance@enterprise.com"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-rose-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Company / Importer of Record *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Global Technologies"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-rose-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Annual Dutiable Import Volume</label>
                      <select
                        value={annualImportValue}
                        onChange={(e) => setAnnualImportValue(e.target.value)}
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-rose-500 focus:outline-hidden font-mono"
                      >
                        <option value="Under $10M USD">&lt; $10M USD annual dutiable imports</option>
                        <option value="$10M – $50M USD">$10M – $50M USD annual dutiable imports</option>
                        <option value="$50M – $200M USD">$50M – $200M USD annual dutiable imports</option>
                        <option value="$200M+ USD">$200M+ USD enterprise importer</option>
                      </select>
                    </div>
                  </div>

                  {/* Privilege Safeguards */}
                  <div className="p-3 bg-[#0B0D11] border border-[#262B35] rounded-xs space-y-1.5 text-slate-400 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Legal Privilege & Protection Standards:</span>
                    </div>
                    <p>• Executed under mutual Non-Disclosure Agreement prior to data transmission.</p>
                    <p>• Zero cloud OCR retention; all parsing executed locally in memory.</p>
                    <p>• Fully documented audit trails prepared for potential 19 CFR § 162.74 submission.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span>Transmitting Privileged Diagnostic Request to Samuel...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit 25-Entry Diagnostic Request ($0 Upfront)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#14171E] border border-rose-800/80 p-8 rounded-sm text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-rose-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Privileged Diagnostic Authorized</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Samuel has received the privileged compliance audit request for <strong>{companyName}</strong>. A countersigned mutual NDA and encrypted document intake link have been sent to <strong>{counselEmail}</strong>.
                </p>
                <div className="inline-block p-3 bg-[#0E1015] border border-[#262B35] rounded-sm text-left text-xs font-mono space-y-1 text-slate-400">
                  <div><strong>Scope:</strong> 25 CBP Form 7501s & Commercial Invoices</div>
                  <div><strong>Legal Standard:</strong> 19 U.S.C. § 1592 & 19 CFR § 152.103</div>
                  <div><strong>Confidentiality:</strong> Attorney-Client Work Product Protocol</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#11141A] border-t border-[#262B35] px-6 py-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-rose-400" />
          <span>19 U.S.C. § 1592 • 19 CFR § 152.103 • 19 CFR § 162.74 Defense</span>
        </span>
        <button
          onClick={() => setActiveStep(activeStep === 3 ? 1 : ((activeStep + 1) as 1 | 2 | 3))}
          className="text-rose-400 hover:text-rose-300 font-semibold"
        >
          {activeStep === 3 ? "Restart Flow" : "Next Step →"}
        </button>
      </div>
    </div>
  );
};
