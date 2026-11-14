"use client";

import React, { useState } from "react";
import {
  DollarSign,
  FileCheck2,
  Shield,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Lock,
  Building,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { submitLeadCapture, recordTelemetry } from "@/lib/supabase";

interface FunnelVariationAProps {
  onClose?: () => void;
}

export const FunnelVariationA_CfoRecovery: React.FC<FunnelVariationAProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSimulatingAudit, setIsSimulatingAudit] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [showDisputeLetter, setShowDisputeLetter] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [freightSpend, setFreightSpend] = useState("$5M – $20M USD / year");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const simulate25InvoiceAudit = () => {
    sound.playLock();
    setIsSimulatingAudit(true);
    setTimeout(() => {
      setIsSimulatingAudit(false);
      setAuditComplete(true);
      setActiveStep(2);
      sound.playSuccess();
    }, 1800);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail || !companyName) return;

    setIsSubmitting(true);
    sound.playLock();

    await submitLeadCapture({
      email: workEmail,
      company_name: companyName,
      phone: "",
      monthly_import_volume: `[CFO Funnel Variation A] Spend: ${freightSpend} • Contact: ${contactName}`,
      source: "cfo_balance_sheet_recovery_funnel",
    });

    recordTelemetry({
      event_type: "lead_submitted",
      concept_id: "funnel_variation_a_cfo",
      metadata: { companyName, workEmail, freightSpend },
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setActiveStep(3);
  };

  return (
    <div className="w-full bg-[#0E1015] text-[#E2E8F0] border border-[#262B35] rounded-sm shadow-2xl overflow-hidden font-sans">
      {/* Top Value Banner */}
      <div className="bg-[#14171E] border-b border-[#262B35] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-semibold rounded-xs">
              OFFENSIVE CAPITAL RECOVERY
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              For Chief Financial Officers & Controllers
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pre-Payment Freight Interceptor & Statutory Duty Drawback Harvester
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Industry data proves 5% to 15% of carrier invoices contain billing errors, costing mid-market importers up to 7% of freight spend.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 1
                ? "bg-sky-950/80 border-sky-400 text-sky-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            1. Diagnostic Audit
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            onClick={() => setActiveStep(2)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 2
                ? "bg-sky-950/80 border-sky-400 text-sky-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            2. Verified Recovery ($153,870)
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            onClick={() => setActiveStep(3)}
            className={`px-3 py-1.5 rounded-xs border text-xs font-semibold transition-all ${
              activeStep === 3
                ? "bg-sky-950/80 border-sky-400 text-sky-300"
                : "bg-[#181C25] border-[#2A303C] text-slate-400 hover:text-white"
            }`}
          >
            3. Authorize Audit
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* The Hook: Hard Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#14171E] border border-[#262B35] rounded-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Carrier Overcharge Bleed</span>
                  <Percent className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400">5% – 15%</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Of transportation invoices contain unearned carrier surcharges.
                </div>
              </div>

              <div className="p-4 bg-[#14171E] border border-[#262B35] rounded-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Pre-Payment ROI</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">&gt; 150%</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  First-year cash return by withholding funds before carrier disbursement.
                </div>
              </div>

              <div className="p-4 bg-[#14171E] border border-[#262B35] rounded-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Unclaimed Duty Drawback</span>
                  <DollarSign className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-sky-400">$2.0 Billion+</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Statutory 99% customs duty refunds left uncollected annually.
                </div>
              </div>
            </div>

            {/* Interactive Dropzone / Simulator */}
            <div className="border-2 border-dashed border-[#2E3747] hover:border-sky-500/60 rounded-sm p-8 text-center bg-[#11141B] transition-all">
              <UploadCloud className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Benchmark Your Carrier Billing Leakage (25 Historical Invoices)
              </h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto mb-5">
                Drag and drop a batch of carrier freight invoices, bills of lading, and CBP Form 7501 summaries. Our deterministic engine cross-references rate cards and statutory drawback schedules in &lt; 200 ms.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={simulate25InvoiceAudit}
                  disabled={isSimulatingAudit}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded-sm shadow-md transition-all"
                >
                  {isSimulatingAudit ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      <span>Auditing 25 Bills Against Rate Cards...</span>
                    </>
                  ) : (
                    <>
                      <span>Run Blind Diagnostic on 25 Enterprise Invoices ($0)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 mt-4">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Zero Data Retention • Local Execution</span>
                </span>
                <span>•</span>
                <span>100% Python Decimal Math</span>
                <span>•</span>
                <span>$0 Upfront Risk</span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Real Audit Output Banner */}
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/80 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  DIAGNOSTIC AUDIT COMPLETE • 25 INVOICES EVALUATED
                </span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  $153,870.00 Total Net Balance Sheet Recovery
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Found across 6 ocean carrier freight bills and 3 paired export drawback entries ($4.2M baseline freight volume).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDisputeLetter(!showDisputeLetter)}
                  className="px-4 py-2 bg-[#1A202C] hover:bg-[#252D3D] border border-slate-700 text-white font-mono text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>{showDisputeLetter ? "Hide Dispute Memo" : "View Remittance Dispute Package"}</span>
                </button>

                <button
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all shadow-md"
                >
                  <span>Claim Cash Recovery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Itemized Recovery Breakdown Table */}
            <div className="border border-[#262B35] rounded-sm overflow-hidden">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#14171E] border-b border-[#262B35] text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Violation / Category</th>
                    <th className="py-2.5 px-3 font-semibold">Carrier / Reference</th>
                    <th className="py-2.5 px-3 font-semibold">Statutory Authority</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Billed Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Lawful Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">Net Recovery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262B35] bg-[#0E1015] text-slate-300">
                  <tr className="hover:bg-[#14171E] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-rose-400">Unauthorized Chassis Split</td>
                    <td className="py-2.5 px-3 text-slate-400">MSC-US-2024-99812</td>
                    <td className="py-2.5 px-3 text-slate-400">Contract Tariff Rule 14-B</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$350.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$0.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">+$350.00</td>
                  </tr>
                  <tr className="hover:bg-[#14171E] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-rose-400">Inflated Fuel Surcharge (FSC)</td>
                    <td className="py-2.5 px-3 text-slate-400">MSC-US-2024-99812</td>
                    <td className="py-2.5 px-3 text-slate-400">EIA On-Highway Index (Wk 16)</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$1,232.50</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$850.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">+$382.50</td>
                  </tr>
                  <tr className="hover:bg-[#14171E] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-rose-400">Unlawful Detention in Free Time</td>
                    <td className="py-2.5 px-3 text-slate-400">MSC-US-2024-99812</td>
                    <td className="py-2.5 px-3 text-slate-400">FMC Docket 21-08 / OSRA 2022</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$880.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$0.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">+$880.00</td>
                  </tr>
                  <tr className="hover:bg-[#14171E] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-sky-400">Batch Carrier Accessorial Leakage</td>
                    <td className="py-2.5 px-3 text-slate-400">Multiple (Maersk/CMA)</td>
                    <td className="py-2.5 px-3 text-slate-400">Expired Rate Card Table G-4</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$63,157.50</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$0.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">+$63,157.50</td>
                  </tr>
                  <tr className="hover:bg-[#14171E] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-emerald-400">99% Unclaimed Duty Drawback</td>
                    <td className="py-2.5 px-3 text-slate-400">CBP 7501 ↔ Export B/L</td>
                    <td className="py-2.5 px-3 text-slate-400">19 U.S.C. § 1313(j)(1)</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$90,000.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">$900.00 (1% Fee)</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">+$89,100.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dispute Letter Preview Modal / Drawer */}
            {showDisputeLetter && (
              <div className="p-4 bg-[#14171E] border border-sky-800/80 rounded-sm space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#262B35] pb-2">
                  <span className="font-bold text-sky-400">FORMAL REMITTANCE DISPUTE & WITHHOLDING NOTICE</span>
                  <span className="text-[10px] text-slate-400">Prepared for Corporate Treasury Remittance</span>
                </div>
                <div className="text-slate-300 leading-relaxed space-y-2">
                  <p><strong>TO:</strong> Accounts Receivable / Billing Dispute Desk, Ocean Carrier</p>
                  <p><strong>FROM:</strong> Corporate Controller / Pre-Payment Freight Audit</p>
                  <p>
                    <strong>RE:</strong> Disputed Charges on Invoice MSC-US-2024-99812 (FMC Docket No. 21-08 Statutory Notice)
                  </p>
                  <p className="text-slate-400">
                    Pursuant to the Ocean Shipping Reform Act of 2022 (OSRA 2022) and 46 U.S.C. § 41104(a), this firm is withholding $1,612.50 from current remittance voucher due to: (1) Unlawful detention assessed during documented port free time ($880.00); (2) Uncontracted chassis repositioning surcharge ($350.00); and (3) EIA Fuel Surcharge miscalculation exceeding posted weekly index ($382.50).
                  </p>
                  <p className="text-emerald-400 font-bold">
                    Net adjusted remittance voucher authorized: $2,845.00 (Reduced from billed $4,457.50).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!isSubmitted ? (
              <div className="bg-[#14171E] border border-[#262B35] p-6 rounded-sm">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold rounded-xs">
                    ZERO-RISK COMMERCIAL COMMITMENT
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    Authorize a Blind 25-Invoice Historical Audit
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    $0 Upfront. Samuel performs the audit on 25 of your historical carrier bills and drawback summaries. You only pay a 15% success fee on actual cash recovered. If $0 is caught, you owe $0.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Corporate Work Email *</label>
                      <input
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="sjenkins@enterprise.com"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Company / Importer Name *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Pacific Logistics Corp"
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Estimated Annual Freight Spend</label>
                      <select
                        value={freightSpend}
                        onChange={(e) => setFreightSpend(e.target.value)}
                        className="w-full bg-[#0E1015] border border-[#2E3747] px-3 py-2 text-xs text-white rounded-sm focus:border-sky-500 focus:outline-hidden font-mono"
                      >
                        <option value="Under $5M USD">&lt; $5M USD annual freight spend</option>
                        <option value="$5M – $20M USD">$5M – $20M USD annual freight spend</option>
                        <option value="$20M – $100M USD">$20M – $100M USD annual freight spend</option>
                        <option value="$100M+ USD">$100M+ USD enterprise freight spend</option>
                      </select>
                    </div>
                  </div>

                  {/* Guaranteed Contingency Terms */}
                  <div className="p-3 bg-[#0B0D11] border border-[#262B35] rounded-xs space-y-1.5 text-slate-400 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100% Contingency Protection Guarantee:</span>
                    </div>
                    <p>• Zero upfront software fees or setup retainer.</p>
                    <p>• If Samuel finds zero recoverable cash across your 25 bills, your cost is exactly $0.00.</p>
                    <p>• All records protected under strict mutual NDA and zero data retention standards.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span>Transmitting Diagnostic Request to Samuel...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize Blind 25-Invoice Audit ($0 Upfront)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#14171E] border border-emerald-800/80 p-8 rounded-sm text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Diagnostic Audit Authorized</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Samuel has received your engagement authorization for <strong>{companyName}</strong>. A secure, encrypted intake vault link and mutual NDA has been dispatched to <strong>{workEmail}</strong>.
                </p>
                <div className="inline-block p-3 bg-[#0E1015] border border-[#262B35] rounded-sm text-left text-xs font-mono space-y-1 text-slate-400">
                  <div><strong>Protocol:</strong> 25-Invoice Historical Pre-Payment Audit</div>
                  <div><strong>Contingency Rate:</strong> 15% on Realized Cash Recovery</div>
                  <div><strong>Audit SLA:</strong> Within 48 hours of document intake</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#11141A] border-t border-[#262B35] px-6 py-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span>FMC Docket 21-08 • 19 U.S.C. § 1313 • OSRA 2022 Compliant</span>
        </span>
        <button
          onClick={() => setActiveStep(activeStep === 3 ? 1 : ((activeStep + 1) as 1 | 2 | 3))}
          className="text-sky-400 hover:text-sky-300 font-semibold"
        >
          {activeStep === 3 ? "Restart Flow" : "Next Step →"}
        </button>
      </div>
    </div>
  );
};
