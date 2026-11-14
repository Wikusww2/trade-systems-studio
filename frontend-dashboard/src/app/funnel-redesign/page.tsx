import { FunnelRedesignStudio } from "@/components/funnel-variations/FunnelRedesignStudio";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Funnel Redesign Lab | TradeTech Systems Studio",
  description:
    "Empirical conversion funnels designed for Enterprise CFOs and General Counsels. Eliminating AI stigma with deterministic proof.",
};

export default function FunnelRedesignPage() {
  return (
    <main className="min-h-screen bg-[#0E1015] text-[#E2E8F0] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#262B35] pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Return to Diagnostic Console</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Enterprise ICP Conversion Lab</span>
          </div>
        </div>

        {/* Funnel Redesign Studio */}
        <FunnelRedesignStudio initialMode="variation_a" />
      </div>
    </main>
  );
}
