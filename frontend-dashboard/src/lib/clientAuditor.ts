import type { AuditResult, Discrepancy } from "./types";

export interface ClientAuditOptions {
  file: File;
  onProgress?: (status: string) => void;
}

export async function auditUploadedPdf(file: File): Promise<AuditResult> {
  // Dynamically import react-pdf on client to avoid Node.js SSR evaluation
  const { pdfjs } = await import("react-pdf");

  const blobUrl = URL.createObjectURL(file);
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const pageHeight = viewport.height;
  const pageWidth = viewport.width;

  const discrepancies: Discrepancy[] = [];
  let detectedIncoterm = "UNSPECIFIED";
  let hasInsuranceMention = false;
  let totalDeclaredValue = 0;
  let arithmeticLoss = 0;

  // Extract all text lines with normalized [0, 1000) coordinates
  const items = textContent.items.map((item: any) => {
    const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
    const x = tx[4];
    const y = tx[5];
    const width = item.width || 40;
    const height = item.height || 12;

    // Normalize to [0, 1000) where (0,0) is top-left
    const normX = Math.max(0, Math.min(1000, (x / pageWidth) * 1000));
    const normY = Math.max(0, Math.min(1000, ((pageHeight - y - height) / pageHeight) * 1000));
    const normW = Math.max(10, Math.min(1000, (width / pageWidth) * 1000));
    const normH = Math.max(10, Math.min(1000, (height / pageHeight) * 1000));

    return {
      text: item.str,
      x: normX,
      y: normY,
      width: normW,
      height: normH,
    };
  });

  const fullText = items.map((i) => i.text).join(" ");
  const upperText = fullText.toUpperCase();

  // 1. Incoterms & Valuation Check
  if (upperText.includes("CIF") || upperText.includes("C.I.F.")) {
    detectedIncoterm = "CIF";
    if (upperText.includes("INSURANCE") || upperText.includes("MARINE")) {
      hasInsuranceMention = true;
    } else {
      // Missing marine insurance on CIF contract
      const cifItem = items.find((i) => i.text.toUpperCase().includes("CIF")) || {
        x: 50,
        y: 120,
        width: 300,
        height: 25,
      };

      discrepancies.push({
        id: "client-disc-cif-01",
        concept_id: "concept_1_customs",
        title: "CIF Destination Missing Mandatory Marine Insurance",
        description:
          "Invoice declared under Incoterms CIF without separate marine insurance policy or explicit insurance cost line item. Flagged for review under 19 CFR § 152.103 transaction value rules.",
        statutory_code: "19 CFR § 152.103 / 19 U.S.C. § 1401a",
        severity: "critical",
        exposure_amount: 0.0,
        confidence: 0.94,
        bounding_box: {
          x: cifItem.x,
          y: cifItem.y,
          width: Math.max(180, cifItem.width * 2),
          height: Math.max(24, cifItem.height * 1.5),
          page_number: 1,
          confidence: 0.94,
        },
        metadata: {
          incoterm: "CIF",
          remedy: "Provide marine cargo insurance policy certificate or recalculate FOB port base. Exposure amount indeterminate under browser heuristic inspection.",
        },
      });
    }
  } else if (upperText.includes("FOB") || upperText.includes("F.O.B.")) {
    detectedIncoterm = "FOB";
  } else if (upperText.includes("DDP") || upperText.includes("D.D.P.")) {
    detectedIncoterm = "DDP";
  }

  // 2. Scan for mathematical totals and line-item discrepancies
  // Look for currency amounts like $25,000.00 or numbers
  const moneyRegex = /\$?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g;
  let match: RegExpExecArray | null;
  const numbersFound: number[] = [];

  while ((match = moneyRegex.exec(fullText)) !== null) {
    const rawVal = match[1].replace(/,/g, "");
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0 && val < 10000000) {
      numbersFound.push(val);
    }
  }

  if (numbersFound.length > 0) {
    totalDeclaredValue = Math.max(...numbersFound);
  } else {
    totalDeclaredValue = 0.0;
  }

  // If arithmetic or freight overbilling indicators exist
  if (upperText.includes("CHASSIS SPLIT") || upperText.includes("DETENTION")) {
    const splitItem = items.find((i) =>
      i.text.toUpperCase().includes("CHASSIS") || i.text.toUpperCase().includes("DETENTION")
    ) || { x: 50, y: 350, width: 350, height: 25 };

    discrepancies.push({
      id: "client-disc-freight-01",
      concept_id: "concept_2_freight",
      title: "Potential Accessorial Surcharge Keyword Detected",
      description:
        "Surcharge keyword (chassis split / detention) identified by heuristic pattern scanner. Flagged for tariff verification under 46 U.S.C. § 41104(a).",
      statutory_code: "46 U.S.C. § 41104(a) / FMC Docket 21-08",
      severity: "critical",
      exposure_amount: 0.0,
      confidence: 0.91,
      bounding_box: {
        x: splitItem.x,
        y: splitItem.y,
        width: Math.max(220, splitItem.width * 2),
        height: Math.max(24, splitItem.height * 1.5),
        page_number: 1,
        confidence: 0.91,
      },
      metadata: {
        remedy: "Verify carrier contract tariff schedule. Exposure amount indeterminate without carrier contract rate sheets.",
      },
    });
  }

  // Heuristic scan does not fabricate statutory penalties
  const penaltyExposure = 0.0;
  const carrierOverbilling = 0.0;

  return {
    concept_id: "client_upload_audit",
    title: `Demo Heuristic Inspection: ${file.name}`,
    subtitle:
      discrepancies.length === 0
        ? "Demo heuristic inspection: zero keyword pattern anomalies detected. Does not certify statutory compliance."
        : `${discrepancies.length} heuristic pattern anomalies flagged for review (not a formal statutory audit)`,
    document_filename: file.name,
    document_url: blobUrl,
    metrics: {
      penalty_exposure_avoided: penaltyExposure,
      carrier_overbilling_caught: carrierOverbilling,
      drawback_unclaimed_unlocked: 0.0,
    },
    discrepancies,
    extracted_data: {
      filename: file.name,
      file_size_bytes: file.size,
      incoterms_detected: detectedIncoterm,
      total_declared_value: totalDeclaredValue,
      declared_value_status: numbersFound.length > 0 ? "Extracted from text" : "Not Detected (Indeterminate)",
      audit_environment: "Client Browser Heuristic Pattern Matcher (Demonstration Only - Not a Statutory Audit)",
      inspection_type: "Demo heuristic inspection - not a formal statutory audit",
    },
    offline_fallback_active: true,
  };
}
