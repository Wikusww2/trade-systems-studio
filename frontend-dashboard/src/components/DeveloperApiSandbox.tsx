"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Zap, Code2, Play } from "lucide-react";
import { motion } from "framer-motion";

export const DeveloperApiSandbox: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<"cargowise" | "evaluate_gri" | "valuation">("cargowise");
  const [isRunning, setIsRunning] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const curlCommands = {
    cargowise: `curl -X POST "https://api.trade-systems.internal/v1/export/cargowise-xml" \\
  -H "Content-Type: application/json" \\
  -d '{
    "shipment_id": "S00001000",
    "declaration_id": "B00001000",
    "incoterm": "CIF",
    "invoice_amount": "148500.00",
    "insurance_amount": "1450.00"
  }'`,
    evaluate_gri: `curl -X POST "https://api.trade-systems.internal/v1/hts/classify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Industrial Controller Assembly with Integrated Circuitry",
    "value_usd": "148500.00",
    "origin_country": "ZA"
  }'`,
    valuation: `curl -X POST "https://api.trade-systems.internal/v1/valuation/audit-entry" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entry_number": "859-2026-0012",
    "declared_transaction_value": "148500.00",
    "duty_rate_ad_valorem": "0.054"
  }'`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommands[activeEndpoint]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      if (activeEndpoint === "cargowise") {
        setResponseOutput(`HTTP/1.1 200 OK
Content-Type: application/xml
X-Latency-Ms: 38ms
X-Deterministic-Engine: python-decimal-std

<UniversalInterchange xmlns="http://www.cargowise.com/Schemas/Universal/2011/11" version="1.1">
  <Header>
    <SenderID>TRADESYSTEMS_PREAUDIT</SenderID>
    <RecipientID>CW1_EADAPTOR_PRD</RecipientID>
  </Header>
  <Body>
    <UniversalShipment>
      <DataContext>
        <DataTargetCollection>
          <DataTarget><Type>ForwardingShipment</Type><Key>S00001000</Key></DataTarget>
          <DataTarget><Type>CustomsDeclaration</Type><Key>B00001000</Key></DataTarget>
        </DataTargetCollection>
      </DataContext>
      <CommercialInvoiceCollection>
        <CommercialInvoice>
          <InsuranceAmount Currency="USD">1450.00</InsuranceAmount>
          <CommercialInvoiceLine>
            <HarmonizedCode>8542.31</HarmonizedCode>
            <CustomsValue Currency="USD">149950.00</CustomsValue>
          </CommercialInvoiceLine>
        </CommercialInvoice>
      </CommercialInvoiceCollection>
    </UniversalShipment>
  </Body>
</UniversalInterchange>`);
      } else {
        setResponseOutput(`HTTP/1.1 200 OK
Content-Type: application/json
X-Latency-Ms: 44ms
X-GRI-Rule: WCO GRI 3(b) Essential Character

{
  "status": "DETERMINISTIC_PARITY_VERIFIED",
  "recommended_hts": "8542.31.0000",
  "base_rate": "0.00%",
  "section_301_exposure": "0.00",
  "statutory_authority": "19 U.S.C. § 1202 General Rules of Interpretation 3(b)"
}`);
      }
    }, 280);
  };

  return (
    <div className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl overflow-hidden p-4 font-mono text-xs shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Developer API & curl Playground</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <Zap className="w-3 h-3" />
            <span>38ms roundtrip</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#1E293B] rounded-lg p-0.5 border border-[#334155]/60">
            <button
              onClick={() => { setActiveEndpoint("cargowise"); setResponseOutput(null); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${activeEndpoint === "cargowise" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              /export/cargowise-xml
            </button>
            <button
              onClick={() => { setActiveEndpoint("evaluate_gri"); setResponseOutput(null); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${activeEndpoint === "evaluate_gri" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              /hts/classify
            </button>
            <button
              onClick={() => { setActiveEndpoint("valuation"); setResponseOutput(null); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${activeEndpoint === "valuation" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              /valuation/audit-entry
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-slate-700 text-slate-300 rounded border border-[#334155] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px]">{copied ? "Copied" : "Copy curl"}</span>
          </button>
        </div>
      </div>

      <div className="mt-3 relative">
        <pre className="p-3 bg-[#0B0F19] rounded-lg border border-[#1E293B] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
          <code>{curlCommands[activeEndpoint]}</code>
        </pre>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] transition-all shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isRunning ? "Executing..." : "Execute Test Request"}</span>
        </button>
      </div>

      {responseOutput && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-[#1E293B]"
        >
          <div className="flex items-center justify-between pb-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <span>Terminal Response Payload</span>
            <span className="text-emerald-400">Deterministic Parity Verified</span>
          </div>
          <pre className="p-3 bg-[#0B0F19] rounded-lg border border-emerald-950 text-emerald-300/90 overflow-x-auto text-[10px] leading-relaxed max-h-48">
            <code>{responseOutput}</code>
          </pre>
        </motion.div>
      )}
    </div>
  );
};
