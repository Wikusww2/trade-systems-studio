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

// -------------------------------------------------------------
// Pillar 3: HTS Classification Copilot Types
// -------------------------------------------------------------
export interface GRIDecisionNode {
  step_rule: string;
  heading_or_subheading: string;
  description: string;
  legal_rationale: string;
  confidence: number;
  passed: boolean;
  competing_candidates: string[];
}

export interface LandedCostBreakdown {
  entered_value: string | number;
  duty_rate_ad_valorem: string | number;
  customs_duty: string | number;
  mpf_rate: string | number;
  mpf_min_cap: string | number;
  mpf_max_cap: string | number;
  mpf_fee: string | number;
  hmf_rate: string | number;
  hmf_fee: string | number;
  freight_and_insurance: string | number;
  total_customs_cost: string | number;
  total_landed_cost: string | number;
}

export interface HTSClassificationResult {
  item_id: string;
  product_title: string;
  input_description: string;
  country_of_origin: string;
  declared_hts_code?: string;
  classified_hts_code: string;
  confidence: number;
  requires_human_review: boolean;
  gri_path: GRIDecisionNode[];
  chapter_notes_cited: string[];
  landed_cost: LandedCostBreakdown;
}

// -------------------------------------------------------------
// Pillar 4: CBP Assist & Valuation Register Types
// -------------------------------------------------------------
export type AssistCategory =
  | "tooling_dies_molds"
  | "foreign_engineering_design"
  | "materials_consumed"
  | "production_equipment";

export type AmortizationMethod =
  | "first_entry"
  | "units_produced"
  | "historical_schedule";

export interface AssistItem {
  id: string;
  description: string;
  category: AssistCategory;
  supplier_name: string;
  country_of_origin: string;
  total_acquisition_cost: string | number;
  anticipated_total_units: number;
  units_shipped_to_date: number;
  amortization_method: AmortizationMethod;
  is_declared_to_cbp: boolean;
  per_unit_amortized_cost: string | number;
  remaining_unamortized_cost: string | number;
}

export interface EntryValuationAudit {
  entry_number: string;
  importer_of_record: string;
  declared_transaction_value: string | number;
  duty_rate_ad_valorem: string | number;
  invoice_incoterm: string;
  international_freight_in_invoice: string | number;
  marine_insurance_in_invoice: string | number;
  improper_cif_overvaluation: string | number;
  assists_omitted_cost: string | number;
  adjusted_lawful_dutiable_value: string | number;
  lawful_duty_due: string | number;
  declared_duty_paid: string | number;
  duty_underpayment: string | number;
  statutory_interest_19usc1505: string | number;
  negligence_penalty_exposure: string | number;
  gross_negligence_penalty_exposure: string | number;
  prior_disclosure_tender_amount: string | number;
  total_liability_avoided: string | number;
  assists_audited: AssistItem[];
}

export interface PriorDisclosurePackage {
  filing_reference_id: string;
  port_of_entry: string;
  addressed_to: string;
  statutory_statutes_cited: string[];
  narrative_explanation: string;
  affected_entries: string[];
  actual_duty_loss: string | number;
  interest_tender_amount: string | number;
  total_tender_check: string | number;
  letter_text: string;
}
