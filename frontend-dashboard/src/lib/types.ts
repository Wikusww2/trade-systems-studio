export interface BoundingBox {
  x: number; // [0, 1000)
  y: number; // [0, 1000)
  width: number; // [0, 1000)
  height: number; // [0, 1000)
  page_number: number;
  confidence: number;
}

export interface Discrepancy {
  id: string;
  concept_id: string;
  title: string;
  description: string;
  statutory_code: string;
  severity: "critical" | "warning" | "info" | "opportunity";
  exposure_amount: number;
  confidence: number;
  bounding_box: BoundingBox;
  executive_summary?: string;
  financial_blast_radius?: string;
  statutory_defense?: string;
  metadata?: Record<string, any>;
}

export interface KillShotMetrics {
  penalty_exposure_avoided: number;
  carrier_overbilling_caught: number;
  drawback_unclaimed_unlocked: number;
}

export interface AuditResult {
  concept_id: string;
  title: string;
  subtitle: string;
  document_filename: string;
  document_url: string;
  metrics: KillShotMetrics;
  discrepancies: Discrepancy[];
  extracted_data: Record<string, any>;
  offline_fallback_active?: boolean;
}

export interface LeadCapturePayload {
  email: string;
  company_name: string;
  phone?: string;
  monthly_import_volume?: string;
  source?: string;
}

export interface TelemetryPayload {
  event_type: string;
  concept_id?: string;
  discrepancy_id?: string;
  metadata?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  label: string;
  country: string;
  is_blocked: boolean;
  risk_level: "SDN_BLOCKED" | "HIGH_RISK_SHELL" | "CLEAN_COMMERCIAL" | "PEP";
  programs: string[];
  sanction_authority?: string;
  notes?: string;
}

export interface GraphEdge {
  source_id: string;
  target_id: string;
  ownership_pct: number;
  relationship_type: string;
}

export interface OFAC50PercentEvaluation {
  target_entity_id: string;
  target_entity_name: string;
  total_blocked_ownership_pct: number;
  is_blocked_by_50_percent_rule: boolean;
  direct_sdn_status: boolean;
  statutory_citation: string;
  blocking_entities: Array<{
    owner_id: string;
    owner_name: string;
    country: string;
    ownership_pct: number;
    programs: string[];
  }>;
  compliance_action: "BLOCK_AND_REPORT" | "ENHANCED_DUE_DILIGENCE" | "CLEAR_TRANSACTION";
}

export interface CorporateGraphResponse {
  target_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  evaluation: OFAC50PercentEvaluation;
}
