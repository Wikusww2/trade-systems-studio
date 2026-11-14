import { AuditResult, KillShotMetrics, CorporateGraphResponse } from "./types";
import { MOCK_AUDIT_DATA, AGGREGATE_METRICS, MOCK_SANCTIONS_GRAPHS } from "@/data/mockData";

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
