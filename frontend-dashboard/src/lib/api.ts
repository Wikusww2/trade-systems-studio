import {
  AuditResult,
  KillShotMetrics,
  CorporateGraphResponse,
  HTSClassificationResult,
  AssistItem,
  EntryValuationAudit,
  PriorDisclosurePackage,
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAudit(conceptId: string): Promise<AuditResult> {
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

// -------------------------------------------------------------
// Pillar 3: HTS Classification Copilot API
// -------------------------------------------------------------
export async function fetchHtsPreset(
  presetId: string,
  enteredValue: number = 45000
): Promise<HTSClassificationResult> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/hts/preset/${presetId}?entered_value=${enteredValue}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    return MOCK_HTS_PRESETS[presetId] || MOCK_HTS_PRESETS["drone_motor"];
  }
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
  try {
    const res = await fetch(`${API_BASE}/api/v1/hts/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    // Determine closest preset or fallback
    const title = payload.product_title.toLowerCase();
    if (title.includes("motor") || title.includes("drone")) return MOCK_HTS_PRESETS["drone_motor"];
    if (title.includes("accelerator") || title.includes("tensor") || title.includes("pcie")) return MOCK_HTS_PRESETS["server_accelerator"];
    if (title.includes("battery") || title.includes("lifepo4")) return MOCK_HTS_PRESETS["ev_battery_pack"];
    return MOCK_HTS_PRESETS["smart_apparel_watch"];
  }
}

// -------------------------------------------------------------
// Pillar 4: CBP Assist & Valuation Register API
// -------------------------------------------------------------
export async function fetchValuationLedger(): Promise<AssistItem[]> {
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
