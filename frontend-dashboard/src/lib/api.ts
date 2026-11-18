import {
  AuditResult,
  KillShotMetrics,
  CorporateGraphResponse,
  HTSClassificationResult,
  AssistItem,
  EntryValuationAudit,
  PriorDisclosurePackage,
  LeadCapturePayload,
} from "./types";
import {
  MOCK_AUDIT_DATA,
  AGGREGATE_METRICS,
  MOCK_SANCTIONS_GRAPHS,
  MOCK_HTS_PRESETS,
  MOCK_ASSIST_ITEMS,
  MOCK_VALUATION_AUDIT,
  MOCK_PRIOR_DISCLOSURE,
} from "@/data/mockData";

// In browser environments on public hosts (e.g. GitHub Pages demo), avoid attempting
// loopback fetches to http://localhost:8000 which are blocked by CORS Private Network Access.
const isBrowser = typeof window !== "undefined";
const isPublicHost =
  isBrowser &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";
const isOfflineForced = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";
const API_BASE = isOfflineForced
  ? ""
  : process.env.NEXT_PUBLIC_API_URL || (isPublicHost ? "" : "http://localhost:8000");

export async function fetchAudit(conceptId: string): Promise<AuditResult> {
  if (!API_BASE) {
    return MOCK_AUDIT_DATA[conceptId] || MOCK_AUDIT_DATA["concept_1_customs"];
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/audit/${conceptId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // Offline / zero-key deterministic fallback
    return (
      MOCK_AUDIT_DATA[conceptId] ||
      MOCK_AUDIT_DATA["concept_1_customs"]
    );
  }
}

export async function fetchAggregateMetrics(): Promise<KillShotMetrics> {
  if (!API_BASE) {
    return AGGREGATE_METRICS;
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/metrics`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return AGGREGATE_METRICS;
  }
}

export async function fetchSanctionsGraph(
  entityId: string
): Promise<CorporateGraphResponse> {
  if (!API_BASE) {
    return (
      MOCK_SANCTIONS_GRAPHS[entityId] ||
      MOCK_SANCTIONS_GRAPHS["bis-el-cn-0941"]
    );
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/sanctions/graph/${entityId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return (
      MOCK_SANCTIONS_GRAPHS[entityId] ||
      MOCK_SANCTIONS_GRAPHS["bis-el-cn-0941"]
    );
  }
}

import { calculateClientLandedCost } from "./money";

export function isOfflineMode(): boolean {
  return !API_BASE;
}

// -------------------------------------------------------------
// Pillar 3: HTS Classification Copilot API
// -------------------------------------------------------------
export async function fetchHtsPreset(
  presetId: string,
  enteredValue: number = 45000,
  isOceanFreight: boolean = true
): Promise<HTSClassificationResult> {
  if (!API_BASE) {
    const base = MOCK_HTS_PRESETS[presetId] || MOCK_HTS_PRESETS["drone_motor"];
    const dutyRate = base.landed_cost.duty_rate_ad_valorem;
    const sec301 = base.landed_cost.section_301_rate || "0.00";
    return {
      ...base,
      landed_cost: calculateClientLandedCost({
        enteredValue,
        dutyRateAdValorem: dutyRate,
        isOceanFreight,
        freightAndInsurance: base.landed_cost.freight_and_insurance || "1500.00",
        section301Rate: sec301,
      }),
    };
  }
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/hts/preset/${presetId}?entered_value=${enteredValue}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    const base = MOCK_HTS_PRESETS[presetId] || MOCK_HTS_PRESETS["drone_motor"];
    return {
      ...base,
      landed_cost: calculateClientLandedCost({
        enteredValue,
        dutyRateAdValorem: base.landed_cost.duty_rate_ad_valorem,
        isOceanFreight,
        freightAndInsurance: base.landed_cost.freight_and_insurance || "1500.00",
        section301Rate: base.landed_cost.section_301_rate || "0.00",
      }),
    };
  }
}

const NON_APPARATUS_EXCLUSIONS_FE = [
  /\b(?:t-?shirts?|hoodies?|clothing|apparel|hats?|caps?|socks?|jackets?)\b/i,
  /\b(?:shaving\s+cream|cosmetics?|lotions?|soaps?|shampoos?)\b/i,
  /\b(?:paintings?|artwork|posters?|canvas(?:es)?|drawings?)\b/i,
  /\b(?:oils?|greases?|lubricants?|fuels?|additives?)\b/i,
  /\b(?:keycaps?|keyboard\s+keys?|novelty|stickers?|decals?|patch(?:es)?)\b/i,
  /\b(?:foods?|supplements?|vitamins?|powders?|capsules?|pills?)\b/i,
  /\b(?:books?|manuals?|magazines?|guides?|catalogs?)\b/i,
];

function matchOfflinePreset(text: string): HTSClassificationResult | null {
  const t = text.toLowerCase();
  if (NON_APPARATUS_EXCLUSIONS_FE.some((rx) => rx.test(t))) {
    return null;
  }
  if (/\b(?:motor|drone|uav|brushless|esc|speed\s+controller)\b/i.test(t)) {
    return MOCK_HTS_PRESETS["drone_motor"];
  }
  if (/\b(?:accelerator|tensor|pcie|gpu|npu|neural|processor)\b/i.test(t)) {
    return MOCK_HTS_PRESETS["server_accelerator"];
  }
  if (/\b(?:battery|lifepo4|accumulator|lithium|energy\s+storage|pack)\b/i.test(t)) {
    return MOCK_HTS_PRESETS["ev_battery_pack"];
  }
  if (/\b(?:fitness|smartband|smartwatch|wearable|ppg|biometric)\b/i.test(t)) {
    return MOCK_HTS_PRESETS["smart_apparel_watch"];
  }
  return null;
}

export async function classifyHtsProduct(
  payload: {
    product_title: string;
    product_description: string;
    commercial_attributes?: string;
    entered_value: number;
    is_ocean_freight?: boolean;
    freight_and_insurance?: number;
  }
): Promise<HTSClassificationResult> {
  const combinedText = `${payload.product_title} ${payload.product_description}`;
  if (!API_BASE) {
    const matched = matchOfflinePreset(combinedText);
    if (!matched) {
      // Fail closed: Unknown goods require licensed broker review (C3-FE, L8)
      return {
        item_id: "hts-unclassified",
        product_title: payload.product_title,
        input_description: payload.product_description,
        country_of_origin: "UNKNOWN",
        classified_hts_code: "REQUIRES_BROKER_REVIEW",
        confidence: 0.0,
        requires_human_review: true,
        gri_path: [],
        chapter_notes_cited: [
          "Unclassified merchandise: product description does not match pre-computed GRI patterns.",
          "Mandatory review by licensed customs broker required under 19 CFR Part 111 before CBP entry filing."
        ],
        landed_cost: calculateClientLandedCost({
          enteredValue: payload.entered_value,
          dutyRateAdValorem: "0.00",
          isOceanFreight: payload.is_ocean_freight ?? true,
          freightAndInsurance: payload.freight_and_insurance ?? 0,
        }),
      };
    }
    return {
      ...matched,
      landed_cost: calculateClientLandedCost({
        enteredValue: payload.entered_value,
        dutyRateAdValorem: matched.landed_cost.duty_rate_ad_valorem,
        isOceanFreight: payload.is_ocean_freight ?? true,
        freightAndInsurance: payload.freight_and_insurance ?? matched.landed_cost.freight_and_insurance,
        section301Rate: matched.landed_cost.section_301_rate,
      }),
    };
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/hts/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    const matched = matchOfflinePreset(combinedText);
    if (!matched) {
      return {
        item_id: "hts-unclassified",
        product_title: payload.product_title,
        input_description: payload.product_description,
        country_of_origin: "UNKNOWN",
        classified_hts_code: "REQUIRES_BROKER_REVIEW",
        confidence: 0.0,
        requires_human_review: true,
        gri_path: [],
        chapter_notes_cited: [
          "Unclassified merchandise: product description does not match pre-computed GRI patterns.",
          "Mandatory review by licensed customs broker required under 19 CFR Part 111 before CBP entry filing."
        ],
        landed_cost: calculateClientLandedCost({
          enteredValue: payload.entered_value,
          dutyRateAdValorem: "0.00",
          isOceanFreight: payload.is_ocean_freight ?? true,
          freightAndInsurance: payload.freight_and_insurance ?? 0,
        }),
      };
    }
    return {
      ...matched,
      landed_cost: calculateClientLandedCost({
        enteredValue: payload.entered_value,
        dutyRateAdValorem: matched.landed_cost.duty_rate_ad_valorem,
        isOceanFreight: payload.is_ocean_freight ?? true,
        freightAndInsurance: payload.freight_and_insurance ?? matched.landed_cost.freight_and_insurance,
        section301Rate: matched.landed_cost.section_301_rate,
      }),
    };
  }
}

// -------------------------------------------------------------
// Pillar 4: CBP Assist & Valuation Register API
// -------------------------------------------------------------
export async function fetchValuationLedger(): Promise<AssistItem[]> {
  if (!API_BASE) {
    return MOCK_ASSIST_ITEMS;
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/valuation/ledger`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_ASSIST_ITEMS;
  }
}

export async function fetchValuationAudit(): Promise<EntryValuationAudit> {
  if (!API_BASE) {
    return MOCK_VALUATION_AUDIT;
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/valuation/audit-entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry_number: "CBP-7501-84920184",
        importer_of_record: "Pacific Tech Imports LLC (EIN 94-8291048)",
        declared_transaction_value: "450000.00",
        duty_rate_ad_valorem: "0.054",
        current_entry_units: 15000,
        invoice_incoterm: "CIF Los Angeles",
        international_freight_in_invoice: "24500.00",
        marine_insurance_in_invoice: "3200.00",
        months_elapsed: 9,
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_VALUATION_AUDIT;
  }
}

export async function generatePriorDisclosurePackage(): Promise<PriorDisclosurePackage> {
  if (!API_BASE) {
    return MOCK_PRIOR_DISCLOSURE;
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/valuation/prior-disclosure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry_number: "CBP-7501-84920184",
        importer_of_record: "Pacific Tech Imports LLC (EIN 94-8291048)",
        declared_transaction_value: "450000.00",
        duty_rate_ad_valorem: "0.054",
        current_entry_units: 15000,
        invoice_incoterm: "CIF Los Angeles",
        international_freight_in_invoice: "24500.00",
        marine_insurance_in_invoice: "3200.00",
        months_elapsed: 9,
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_PRIOR_DISCLOSURE;
  }
}

const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "";

export async function submitLeadApi(
  payload: LeadCapturePayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Prefer dedicated lead webhook/Formspree endpoint if configured
  if (LEAD_ENDPOINT) {
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return { success: false, error: `Lead endpoint error ${res.status}` };
      }
      const data = await res.json().catch(() => ({}));
      return { success: true, id: data.lead_id || data.id || `lead_${Date.now()}` };
    } catch (err: any) {
      return { success: false, error: err?.message || "NETWORK_ERROR" };
    }
  }

  // Never attempt http://localhost:8000 fetches from public HTTPS hosts (e.g. GitHub Pages)
  if (!API_BASE) {
    return { success: false, error: "STATIC_HOST_NO_BACKEND" };
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { success: false, error: `API error ${res.status}` };
    }
    const data = await res.json();
    return { success: true, id: data.lead_id || data.id || `lead_${Date.now()}` };
  } catch (err: any) {
    return { success: false, error: err?.message || "NETWORK_ERROR" };
  }
}

export async function uploadAndAuditDocument(file: File): Promise<AuditResult> {
  if (API_BASE) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/audit/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend upload failed, falling back to local client auditor:", e);
    }
  }
  // Fallback to local client auditor
  const { auditUploadedPdf } = await import("./clientAuditor");
  return await auditUploadedPdf(file);
}

