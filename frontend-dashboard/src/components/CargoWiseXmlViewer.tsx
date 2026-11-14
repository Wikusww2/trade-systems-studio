"use client";

import React, { useState } from "react";
import { Code2, Copy, Check, Download, Send, CheckCircle2, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

interface CargoWiseXmlViewerProps {
  shipmentId?: string;
  conceptId?: string;
}

export const CargoWiseXmlViewer: React.FC<CargoWiseXmlViewerProps> = ({
  shipmentId = "S00001000",
  conceptId = "concept_1_customs"
}) => {
  const [viewMode, setViewMode] = useState<"reconciled" | "raw">("reconciled");
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const rawXml = `<?xml version="1.0" encoding="utf-8"?>
<UniversalInterchange xmlns="http://www.cargowise.com/Schemas/Universal/2011/11" version="1.1">
  <Header>
    <SenderID>TRADESYSTEMS_PREAUDIT</SenderID>
    <RecipientID>CW1_EADAPTOR_PRD</RecipientID>
    <CorrelationID>9b5c9c8e-8a5b-40ed-91a5-4a4fe9060dbd</CorrelationID>
  </Header>
  <Body>
    <UniversalShipment xmlns="http://www.cargowise.com/Schemas/Universal/2011/11" version="1.1">
      <Shipment>
        <DataContext>
          <DataTargetCollection>
            <DataTarget><Type>ForwardingShipment</Type><Key>${shipmentId}</Key></DataTarget>
            <DataTarget><Type>CustomsDeclaration</Type><Key>B00001000</Key></DataTarget>
          </DataTargetCollection>
        </DataContext>
        <CommercialInvoiceCollection>
          <CommercialInvoice>
            <InvoiceNumber>CI-2026-01</InvoiceNumber>
            <Incoterm><Code>CIF</Code></Incoterm>
            <InvoiceAmount Currency="USD">148500.00</InvoiceAmount>
            <!-- DEFECT: Missing CIF Marine Insurance apportionment -->
            <InsuranceAmount Currency="USD">0.00</InsuranceAmount>
            <CommercialInvoiceLineCollection>
              <CommercialInvoiceLine>
                <LineNumber>1</LineNumber>
                <Description>Industrial Controller Assembly with Integrated Circuitry</Description>
                <!-- DEFECT: Subheading 8471.30 misclassified under GRI 1 -->
                <HarmonizedCode>8471.30</HarmonizedCode>
                <CustomsValue Currency="USD">148500.00</CustomsValue>
              </CommercialInvoiceLine>
            </CommercialInvoiceLineCollection>
          </CommercialInvoice>
        </CommercialInvoiceCollection>
        <CustomizedFieldCollection>
          <CustomizedField>
            <Key>PreAuditVerificationStatus</Key>
            <DataType>String</DataType>
            <Value>UNVERIFIED_RAW_INGEST</Value>
          </CustomizedField>
        </CustomizedFieldCollection>
      </Shipment>
    </UniversalShipment>
  </Body>
</UniversalInterchange>`;

  const reconciledXml = `<?xml version="1.0" encoding="utf-8"?>
<UniversalInterchange xmlns="http://www.cargowise.com/Schemas/Universal/2011/11" version="1.1">
  <Header>
    <SenderID>TRADESYSTEMS_PREAUDIT</SenderID>
    <RecipientID>CW1_EADAPTOR_PRD</RecipientID>
    <CorrelationID>9b5c9c8e-8a5b-40ed-91a5-4a4fe9060dbd</CorrelationID>
  </Header>
  <Body>
    <UniversalShipment xmlns="http://www.cargowise.com/Schemas/Universal/2011/11" version="1.1">
      <Shipment>
        <DataContext>
          <DataTargetCollection>
            <DataTarget><Type>ForwardingShipment</Type><Key>${shipmentId}</Key></DataTarget>
            <DataTarget><Type>CustomsDeclaration</Type><Key>B00001000</Key></DataTarget>
          </DataTargetCollection>
          <Company><Code>CPH</Code></Company>
          <EnterpriseID>TRN</EnterpriseID>
          <ServerID>A04</ServerID>
        </DataContext>
        <PortOfOrigin><Code>ZADUR</Code><Name>Durban</Name></PortOfOrigin>
        <PortOfDestination><Code>NLRTM</Code><Name>Rotterdam</Name></PortOfDestination>
        <CommercialInvoiceCollection>
          <CommercialInvoice>
            <InvoiceNumber>CI-2026-01</InvoiceNumber>
            <Incoterm><Code>CIF</Code></Incoterm>
            <InvoiceAmount Currency="USD">148500.00</InvoiceAmount>
            <!-- RECONCILED: Recomputed & added missing CIF Marine Insurance under 19 CFR § 152.103 -->
            <InsuranceAmount Currency="USD">1450.00</InsuranceAmount>
            <CommercialInvoiceLineCollection>
              <CommercialInvoiceLine>
                <LineNumber>1</LineNumber>
                <Description>Industrial Controller Assembly with Integrated Circuitry</Description>
                <!-- RECONCILED [GRI 3(b)]: Reclassified to 8542.31 based on essential character -->
                <HarmonizedCode>8542.31</HarmonizedCode>
                <CustomsValue Currency="USD">149950.00</CustomsValue>
              </CommercialInvoiceLine>
            </CommercialInvoiceLineCollection>
          </CommercialInvoice>
        </CommercialInvoiceCollection>
        <CustomizedFieldCollection>
          <CustomizedField>
            <Key>PreAuditVerificationStatus</Key>
            <DataType>String</DataType>
            <Value>CLEARED_WITH_RECONCILIATION</Value>
          </CustomizedField>
          <CustomizedField>
            <Key>PenaltyExposureMitigated</Key>
            <DataType>String</DataType>
            <Value>19_USC_1592_PROTECTED</Value>
          </CustomizedField>
        </CustomizedFieldCollection>
      </Shipment>
    </UniversalShipment>
  </Body>
</UniversalInterchange>`;

  const activeContent = viewMode === "reconciled" ? reconciledXml : rawXml;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cargowise_${viewMode}_${shipmentId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSimulatePost = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulationStatus("eAdaptor Response: 200 OK · Ingestion Status: ACCEPTED (CorrelationID: 9b5c9c8e)");
    }, 450);
  };

  return (
    <div className="w-full bg-[#0F172A] border border-[#1F2937] rounded-xl overflow-hidden font-mono text-xs shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200">CargoWise One eAdaptor XML (UniversalShipment v1.1)</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
            viewMode === "reconciled"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {viewMode === "reconciled" ? "READY FOR INGESTION" : "COMPLIANCE HOLD"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#1E293B] rounded-lg p-0.5 border border-[#334155]/60">
            <button
              onClick={() => setViewMode("reconciled")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === "reconciled" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Reconciled Lawful XML
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === "raw" ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Raw Unaudited XML
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-slate-700 text-slate-300 rounded border border-[#334155] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-slate-700 text-slate-300 rounded border border-[#334155] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Download .xml</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="p-4 bg-[#0B0F19] text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-[360px] overflow-y-auto">
          <code>{activeContent}</code>
        </pre>
      </div>

      <div className="p-3 bg-[#0F172A] border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400 font-semibold">eAdaptor Ingest Protocol:</span>
          <span className="text-slate-300">HTTP POST /xHub/UniversalShipment</span>
          {simulationStatus && (
            <span className="text-emerald-400 font-bold ml-2">✓ {simulationStatus}</span>
          )}
        </div>

        <button
          onClick={handleSimulatePost}
          disabled={simulating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[11px] transition-all shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{simulating ? "Relaying to eAdaptor..." : "Simulate eAdaptor HTTP+XML POST"}</span>
        </button>
      </div>
    </div>
  );
};
