import {
  AuditResult,
  KillShotMetrics,
  CorporateGraphResponse,
  HTSClassificationResult,
  AssistItem,
  EntryValuationAudit,
  PriorDisclosurePackage,
} from "@/lib/types";

export const AGGREGATE_METRICS: KillShotMetrics = {
  penalty_exposure_avoided: 125000.0,
  carrier_overbilling_caught: 1547.5,
  drawback_unclaimed_unlocked: 27324.0,
};

export const MOCK_AUDIT_DATA: Record<string, AuditResult> = {
  concept_1_customs: {
    concept_id: "concept_1_customs",
    title: "Concept 1: Customs Compliance Firewall",
    subtitle: "19 U.S.C. § 1592 Negligence & 19 CFR § 152.103 Valuation Verification",
    document_filename: "nightmare_01_customs_ci.pdf",
    document_url: "/nightmares/nightmare_01_customs_ci.pdf",
    metrics: {
      penalty_exposure_avoided: 125000.0,
      carrier_overbilling_caught: 0,
      drawback_unclaimed_unlocked: 0,
    },
    discrepancies: [
      {
        id: "disc-c1-01",
        concept_id: "concept_1_customs",
        title: "Missing Mandatory Marine Insurance on CIF Entry",
        description:
          "Transaction value declared CIF Los Angeles requires seller-provided marine insurance. Declaring CIF with $0.00 insurance distorts customs dutiable transaction value under 19 CFR § 152.103.",
        statutory_code: "19 CFR § 152.103",
        severity: "warning",
        exposure_amount: 1200.0,
        confidence: 0.82, // < 0.85 triggers visual uncertainty dashed amber border
        bounding_box: {
          x: 58.0,
          y: 125.0,
          width: 880.0,
          height: 55.0,
          page_number: 1,
          confidence: 0.82,
        },
        metadata: {
          rule: "19_CFR_152_103",
          incoterm: "CIF LOS ANGELES",
          declared_insurance: "$0.00",
        },
      },
      {
        id: "disc-c1-02-line-1",
        concept_id: "concept_1_customs",
        title: "Invoice Line Item Arithmetic Extension Error",
        description:
          "Line 001: 500 units @ $45.00 calculates to $22,500.00, but was invoiced as $25,500.00. Discrepancy of $3,000.00 misstates customs dutiable basis.",
        statutory_code: "19 CFR § 152.103(a)",
        severity: "critical",
        exposure_amount: 3000.0,
        confidence: 0.99,
        bounding_box: {
          x: 58.0,
          y: 360.0,
          width: 880.0,
          height: 50.0,
          page_number: 1,
          confidence: 0.99,
        },
        metadata: {
          line_number: 1,
          stated_total: "$25,500.00",
          calculated_total: "$22,500.00",
          variance: "$3,000.00",
        },
      },
      {
        id: "disc-c1-03",
        concept_id: "concept_1_customs",
        title: "HTS Misclassification & 19 U.S.C. § 1592 Penalty Exposure",
        description:
          "Merchandise declared under HTS 8471.30.0100 (Duty 0.0%) instead of lawful HTS 8542.31.0000 (Section 301 Duty 25.0%). Lawful duty underpaid: $31,250.00. Statutory penalty exposure under 19 U.S.C. § 1592 reaches up to $125,000.00 (Gross Negligence 4.0x).",
        statutory_code: "19 U.S.C. § 1592",
        severity: "critical",
        exposure_amount: 125000.0,
        confidence: 0.96,
        bounding_box: {
          x: 58.0,
          y: 415.0,
          width: 880.0,
          height: 50.0,
          page_number: 1,
          confidence: 0.96,
        },
        metadata: {
          declared_hts: "8471.30.0100",
          lawful_hts: "8542.31.0000",
          dutiable_base: "$125,000.00",
          duty_loss: "$31,250.00",
          negligence_range: ["$7,812.50", "$62,500.00"],
          gross_negligence_range: ["$78,125.00", "$125,000.00"],
        },
      },
    ],
    extracted_data: {
      seller: "Global Micro Electronics Ltd",
      buyer: "Pacific Apex Corp",
      invoice_number: "GME-2024-89912",
      stated_total: 166700.0,
    },
    offline_fallback_active: true,
  },
  concept_2_freight: {
    concept_id: "concept_2_freight",
    title: "Concept 2: Pre-Payment Freight Audit",
    subtitle: "Ocean Demurrage & FMC 46 CFR § 545.5 Tariff Surcharge Intercept",
    document_filename: "nightmare_02_freight_audit.pdf",
    document_url: "/nightmares/nightmare_02_freight_audit.pdf",
    metrics: {
      penalty_exposure_avoided: 0,
      carrier_overbilling_caught: 1547.5,
      drawback_unclaimed_unlocked: 0,
    },
    discrepancies: [
      {
        id: "disc-c2-01",
        concept_id: "concept_2_freight",
        title: "Inflated Fuel Surcharge (FSC) Index Markup",
        description:
          "Carrier billed FSC at 32.50% ($1,462.50) exceeding the authorized DOE/EIA West Coast weekly diesel index contract cap of 24.00% ($1,080.00). Overbill intercepted: $382.50.",
        statutory_code: "Contract Tariff Rule 22 / EIA Index",
        severity: "critical",
        exposure_amount: 382.5,
        confidence: 0.98,
        bounding_box: {
          x: 58.0,
          y: 385.0,
          width: 880.0,
          height: 45.0,
          page_number: 1,
          confidence: 0.98,
        },
        metadata: {
          billed_rate: "32.5%",
          contract_rate: "24.0%",
          variance: "$382.50",
        },
      },
      {
        id: "disc-c2-02",
        concept_id: "concept_2_freight",
        title: "Unauthorized Chassis Split Surcharge",
        description:
          "Carrier assessed $285.00 for off-dock chassis repositioning without a signed Shipper Work Order or pre-dispatch agreement. Disallowed under Ocean Contract Terms Section 8.",
        statutory_code: "UCC § 2-207 / Tariff Sec. 8",
        severity: "warning",
        exposure_amount: 285.0,
        confidence: 0.94,
        bounding_box: {
          x: 58.0,
          y: 435.0,
          width: 880.0,
          height: 45.0,
          page_number: 1,
          confidence: 0.94,
        },
        metadata: {
          charge_code: "ACC-SPLIT",
          billed_amount: "$285.00",
        },
      },
      {
        id: "disc-c2-03",
        concept_id: "concept_2_freight",
        title: "Unlawful Detention Billed Inside Port Free Time",
        description:
          "Carrier billed 4 days container detention ($880.00) on container MSKU-781290-3. Gate out occurred on Friday following Tuesday discharge (Day 4 of 4 allowed business days). Violates FMC OSRA 46 CFR § 545.5.",
        statutory_code: "FMC 46 CFR § 545.5 (OSRA)",
        severity: "critical",
        exposure_amount: 880.0,
        confidence: 0.97,
        bounding_box: {
          x: 58.0,
          y: 485.0,
          width: 880.0,
          height: 45.0,
          page_number: 1,
          confidence: 0.97,
        },
        metadata: {
          free_days_allowed: 4,
          days_held: 4,
          illegal_detention: "$880.00",
        },
      },
    ],
    extracted_data: {
      carrier: "Apex Ocean Logistics Inc",
      bill_number: "FB-2024-99824",
      total_billed: 7127.5,
      net_payable: 5580.0,
    },
    offline_fallback_active: true,
  },
  concept_3_drawback: {
    concept_id: "concept_3_drawback",
    title: "Concept 3: Duty Drawback Harvester",
    subtitle: "19 U.S.C. § 1313 Unused Merchandise 99% CBP Duty Refund Matching",
    document_filename: "nightmare_03_duty_drawback.pdf",
    document_url: "/nightmares/nightmare_03_duty_drawback.pdf",
    metrics: {
      penalty_exposure_avoided: 0,
      carrier_overbilling_caught: 0,
      drawback_unclaimed_unlocked: 27324.0,
    },
    discrepancies: [
      {
        id: "disc-c3-01",
        concept_id: "concept_3_drawback",
        title: "Unclaimed 99% Statutory Duty Drawback Recovery",
        description:
          "Entry 441-9872134-2 paid $27,600.00 in duties & Section 301 tariffs on 2,000 Stepper Motors. Export B/L EXP-2024-88412 confirms 100% export to Germany within the 5-year statutory window. Entitled to direct 99% cash refund from CBP: $27,324.00.",
        statutory_code: "19 U.S.C. § 1313(j)(1)",
        severity: "opportunity",
        exposure_amount: 27324.0,
        confidence: 0.99,
        bounding_box: {
          x: 58.0,
          y: 570.0,
          width: 880.0,
          height: 180.0,
          page_number: 1,
          confidence: 0.99,
        },
        metadata: {
          import_entry: "441-9872134-2",
          export_bl: "EXP-2024-88412",
          statutory_percent: "99.0%",
          cash_recovery_ready: "$27,324.00",
        },
      },
      {
        id: "disc-c3-02",
        concept_id: "concept_3_drawback",
        title: "Matched Export B/L Proof of Unused Re-Export",
        description:
          "Export Bill of Lading EXP-2024-88412 verifies identical part numbers (ST-8800-IND) and full quantity (2,000 units) shipped to Hamburg, Germany, satisfying CBP evidentiary burden of proof.",
        statutory_code: "19 CFR Part 190 / 191",
        severity: "opportunity",
        exposure_amount: 0.0,
        confidence: 0.95,
        bounding_box: {
          x: 58.0,
          y: 430.0,
          width: 880.0,
          height: 110.0,
          page_number: 1,
          confidence: 0.95,
        },
        metadata: {
          carrier: "Hapag-Lloyd",
          destination: "Hamburg, Germany",
          quantity_match: "100%",
        },
      },
    ],
    extracted_data: {
      import_entry: "441-9872134-2",
      export_bl: "EXP-2024-88412",
      duties_paid: 27600.0,
      refund_rate: "99.0%",
    },
    offline_fallback_active: true,
  },
  concept_clean_fob: {
    concept_id: "concept_clean_fob",
    title: "Clean Production Invoice: Verified FOB Terms",
    subtitle: "Clean Baseline Inspection: Zero 19 U.S.C. § 1592 Exposure Flagged",
    document_filename: "clean_01_customs_fob.pdf",
    document_url: "/nightmares/clean_01_customs_fob.pdf",
    metrics: {
      penalty_exposure_avoided: 0,
      carrier_overbilling_caught: 0,
      drawback_unclaimed_unlocked: 0,
    },
    discrepancies: [],
    extracted_data: {
      incoterms: "FOB YANTIAN",
      total_value: 145250.0,
      compliance_status: "VERIFIED_BASELINE",
      assist_declared: "$27,750.00",
      arithmetic_error: "$0.00",
    },
    offline_fallback_active: true,
  },
  concept_4_sanctions: {
    concept_id: "concept_4_sanctions",
    title: "Concept 4: OFAC 50% Rule & Entity Resolution",
    subtitle: "31 CFR § 501 Blocked Entity Aggregation & EAR Defense Watchlist",
    document_filename: "nightmare_04_ofac_registry.pdf",
    document_url: "/nightmares/nightmare_04_ofac_registry.pdf",
    metrics: {
      penalty_exposure_avoided: 350000.0,
      carrier_overbilling_caught: 0,
      drawback_unclaimed_unlocked: 0,
    },
    discrepancies: [
      {
        id: "disc-c4-01",
        concept_id: "concept_4_sanctions",
        title: "31 CFR § 501 Aggregate Blocked Ownership Violation (55%)",
        description:
          "Target entity bis-el-cn-0941 is owned 25% by Victor Petrov (SDN) and 30% by Rosoboronexport JSC (SDN). Aggregate blocked ownership is 55%, rendering the entity blocked by operation of law under the OFAC 50% Rule.",
        severity: "critical",
        confidence: 0.99,
        bounding_box: {
          x: 42.0,
          y: 620.0,
          width: 535.0,
          height: 100.0,
          page_number: 1,
          confidence: 0.99,
        },
        statutory_code: "31 CFR § 501",
        statutory_defense: "OFAC 50 Percent Rule",
        exposure_amount: 350000.0,
        metadata: {
          blocked_ownership_pct: "55.0%",
          blocking_entities: ["Victor Petrov (25%)", "Rosoboronexport JSC (30%)"],
          compliance_action: "BLOCK_AND_REPORT",
        },
      },
    ],
    extracted_data: {
      entity_id: "bis-el-cn-0941",
      name: "Global Micro Electronics Ltd",
      aggregate_blocked_pct: 55.0,
      action: "BLOCK_AND_REPORT",
    },
    offline_fallback_active: true,
  },
};

export const INITIAL_CUSTOMS_NIGHTMARE_FIXTURE: AuditResult = MOCK_AUDIT_DATA["concept_1_customs"];

export const MOCK_SANCTIONS_GRAPHS: Record<string, CorporateGraphResponse> = {
  "bis-el-cn-0941": {
    target_id: "bis-el-cn-0941",
    nodes: [
      {
        id: "bis-el-cn-0941",
        label: "Global Micro Electronics Ltd",
        country: "CN",
        is_blocked: true,
        risk_level: "SDN_BLOCKED",
        programs: ["BIS Entity List (15 CFR Part 744)", "EAR Military End-User"],
        sanction_authority: "BIS",
        notes: "Direct military end-user and prohibited semiconductor export entity.",
      },
      {
        id: "node-petrov",
        label: "Victor Petrov (SDN Oligarch)",
        country: "RU",
        is_blocked: true,
        risk_level: "SDN_BLOCKED",
        programs: ["OFAC SDN (E.O. 14024)", "EU Sanctions Reg 269/2014"],
        sanction_authority: "OFAC",
      },
      {
        id: "node-rosoboron",
        label: "Rosoboronexport JSC",
        country: "RU",
        is_blocked: true,
        risk_level: "SDN_BLOCKED",
        programs: ["OFAC SDN", "CAATSA Section 231"],
        sanction_authority: "OFAC",
      },
      {
        id: "node-shenzhen-adv",
        label: "Shenzhen Advanced Components Ltd",
        country: "CN",
        is_blocked: false,
        risk_level: "CLEAN_COMMERCIAL",
        programs: [],
        sanction_authority: undefined,
      },
    ],
    edges: [
      {
        source_id: "node-petrov",
        target_id: "bis-el-cn-0941",
        ownership_pct: 25.0,
        relationship_type: "BENEFICIAL_OWNER",
      },
      {
        source_id: "node-rosoboron",
        target_id: "bis-el-cn-0941",
        ownership_pct: 30.0,
        relationship_type: "EQUITY_HOLDING",
      },
      {
        source_id: "node-shenzhen-adv",
        target_id: "bis-el-cn-0941",
        ownership_pct: 45.0,
        relationship_type: "COMMERCIAL_SHAREHOLDER",
      },
    ],
    evaluation: {
      target_entity_id: "bis-el-cn-0941",
      target_entity_name: "Global Micro Electronics Ltd",
      total_blocked_ownership_pct: 55.0,
      is_blocked_by_50_percent_rule: true,
      direct_sdn_status: true,
      statutory_citation: "31 CFR § 501 (OFAC 50 Percent Rule)",
      blocking_entities: [
        {
          owner_id: "node-petrov",
          owner_name: "Victor Petrov (SDN Oligarch)",
          country: "RU",
          ownership_pct: 25.0,
          programs: ["OFAC SDN (E.O. 14024)"],
        },
        {
          owner_id: "node-rosoboron",
          owner_name: "Rosoboronexport JSC",
          country: "RU",
          ownership_pct: 30.0,
          programs: ["OFAC SDN", "CAATSA Section 231"],
        },
      ],
      compliance_action: "BLOCK_AND_REPORT",
    },
  },
  "ofac-sdn-ir-0382": {
    target_id: "ofac-sdn-ir-0382",
    nodes: [
      {
        id: "ofac-sdn-ir-0382",
        label: "Apex Ocean Logistics Inc",
        country: "PA",
        is_blocked: true,
        risk_level: "SDN_BLOCKED",
        programs: ["OFAC SDN (E.O. 13846)"],
        sanction_authority: "OFAC",
        notes: "Covert front company operating under primary & secondary sanctions.",
      },
      {
        id: "node-irisl",
        label: "Islamic Republic of Iran Shipping Lines (IRISL)",
        country: "IR",
        is_blocked: true,
        risk_level: "SDN_BLOCKED",
        programs: ["OFAC SDN", "UNSCR 1929"],
        sanction_authority: "OFAC",
      },
      {
        id: "node-panama-trust",
        label: "Panama Maritime Holding Trust",
        country: "PA",
        is_blocked: false,
        risk_level: "HIGH_RISK_SHELL",
        programs: [],
        sanction_authority: undefined,
      },
    ],
    edges: [
      {
        source_id: "node-irisl",
        target_id: "ofac-sdn-ir-0382",
        ownership_pct: 65.0,
        relationship_type: "CONTROLLING_INTEREST",
      },
      {
        source_id: "node-panama-trust",
        target_id: "ofac-sdn-ir-0382",
        ownership_pct: 35.0,
        relationship_type: "NOMINEE_DIRECTOR",
      },
    ],
    evaluation: {
      target_entity_id: "ofac-sdn-ir-0382",
      target_entity_name: "Apex Ocean Logistics Inc",
      total_blocked_ownership_pct: 65.0,
      is_blocked_by_50_percent_rule: true,
      direct_sdn_status: true,
      statutory_citation: "31 CFR § 501 (OFAC 50 Percent Rule)",
      blocking_entities: [
        {
          owner_id: "node-irisl",
          owner_name: "Islamic Republic of Iran Shipping Lines (IRISL)",
          country: "IR",
          ownership_pct: 65.0,
          programs: ["OFAC SDN"],
        },
      ],
      compliance_action: "BLOCK_AND_REPORT",
    },
  },
  "pacific-apex-01": {
    target_id: "pacific-apex-01",
    nodes: [
      {
        id: "pacific-apex-01",
        label: "Pacific Apex Computing Systems Inc",
        country: "US",
        is_blocked: false,
        risk_level: "CLEAN_COMMERCIAL",
        programs: [],
        sanction_authority: undefined,
        notes: "Verified domestic enterprise consignee.",
      },
      {
        id: "node-us-holdings",
        label: "Pacific Apex Holdings Corp",
        country: "US",
        is_blocked: false,
        risk_level: "CLEAN_COMMERCIAL",
        programs: [],
        sanction_authority: undefined,
      },
      {
        id: "node-us-trust",
        label: "California Enterprise Trust",
        country: "US",
        is_blocked: false,
        risk_level: "CLEAN_COMMERCIAL",
        programs: [],
        sanction_authority: undefined,
      },
    ],
    edges: [
      {
        source_id: "node-us-holdings",
        target_id: "pacific-apex-01",
        ownership_pct: 70.0,
        relationship_type: "PARENT_HOLDING",
      },
      {
        source_id: "node-us-trust",
        target_id: "pacific-apex-01",
        ownership_pct: 30.0,
        relationship_type: "BENEFICIAL_OWNER",
      },
    ],
    evaluation: {
      target_entity_id: "pacific-apex-01",
      target_entity_name: "Pacific Apex Computing Systems Inc",
      total_blocked_ownership_pct: 0.0,
      is_blocked_by_50_percent_rule: false,
      direct_sdn_status: false,
      statutory_citation: "31 CFR § 501 (OFAC 50 Percent Rule)",
      blocking_entities: [],
      compliance_action: "CLEAR_TRANSACTION",
    },
  },
};

// -------------------------------------------------------------
// Pillar 3: HTS Classification Copilot Mock Presets
// -------------------------------------------------------------
export const MOCK_HTS_PRESETS: Record<string, HTSClassificationResult> = {
  drone_motor: {
    item_id: "hts-drone_motor",
    product_title: "Industrial Brushless DC Drone Motor with Integrated Electronic Speed Controller (ESC)",
    input_description: "High-torque 480W brushless DC motor for agricultural UAVs with integrated ESC module.",
    country_of_origin: "CN",
    declared_hts_code: "8543.70.9650",
    classified_hts_code: "8501.31.8000",
    confidence: 0.94,
    requires_human_review: false,
    chapter_notes_cited: [
      "Section XVI Note 2 (Classification of Parts of Machines)",
      "Chapter 85 Note 2 (Electric Motors & Generators)",
      "WCO Explanatory Notes to Heading 85.01",
    ],
    gri_path: [
      {
        step_rule: "GRI 1",
        heading_or_subheading: "Chapter 85",
        description: "Electrical machinery and equipment and parts thereof",
        legal_rationale: "Merchandise is primarily an electro-mechanical energy conversion apparatus covered by Chapter 85 terms.",
        confidence: 0.99,
        passed: true,
        competing_candidates: ["Chapter 84 (Machinery and Mechanical Appliances)", "Chapter 88 (Aircraft & Drones)"],
      },
      {
        step_rule: "GRI 1 / GRI 3(b)",
        heading_or_subheading: "Heading 8501",
        description: "Electric motors and generators (excluding generating sets)",
        legal_rationale: "Composite article of an electric motor and speed controller. Under GRI 3(b), the motor provides the essential character of motive propulsion.",
        confidence: 0.93,
        passed: true,
        competing_candidates: ["8504.40 (Static Converters / Speed Controllers)", "8543.70 (Electrical machines with individual functions)"],
      },
      {
        step_rule: "GRI 6",
        heading_or_subheading: "Subheading 8501.31",
        description: "Other DC motors; DC generators: Of an output not exceeding 750 W",
        legal_rationale: "Rated continuous output is 480 Watts, strictly satisfying the under-750W threshold of subheading 8501.31.",
        confidence: 0.96,
        passed: true,
        competing_candidates: ["8501.32 (Output exceeding 750 W but not exceeding 75 kW)"],
      },
      {
        step_rule: "Statutory Suffix",
        heading_or_subheading: "8501.31.8000",
        description: "Other DC motors of an output not exceeding 750 W: Other: Brushless",
        legal_rationale: "Permanent magnet brushless architecture satisfies statistical annotation 8000.",
        confidence: 0.95,
        passed: true,
        competing_candidates: ["8501.31.4000 (Motors of under 18.65 W)"],
      },
    ],
    landed_cost: {
      entered_value: "45000.00",
      duty_rate_ad_valorem: "0.024",
      customs_duty: "1080.00",
      mpf_rate: "0.003464",
      mpf_min_cap: "31.67",
      mpf_max_cap: "614.35",
      mpf_fee: "155.88",
      hmf_rate: "0.00125",
      hmf_fee: "56.25",
      freight_and_insurance: "1500.00",
      total_customs_cost: "1292.13",
      total_landed_cost: "47792.13",
    },
  },
  server_accelerator: {
    item_id: "hts-server_accelerator",
    product_title: "Enterprise AI Tensor Accelerator PCIe Card with Integrated Vapor Chamber",
    input_description: "High-performance PCIe computation accelerator utilizing multicomponent integrated circuits (MCOs).",
    country_of_origin: "TW",
    declared_hts_code: "8471.80.1000",
    classified_hts_code: "8542.31.0001",
    confidence: 0.96,
    requires_human_review: false,
    chapter_notes_cited: [
      "Chapter 84 Note 5(E) (Exclusion of machines incorporating ADP units)",
      "Chapter 85 Note 9(b)(i) (Definition of Multicomponent Integrated Circuits MCOs)",
      "WTO Information Technology Agreement (ITA-1) Zero-Duty Concession",
    ],
    gri_path: [
      {
        step_rule: "GRI 1",
        heading_or_subheading: "Chapter 85",
        description: "Electrical machinery and equipment and parts thereof",
        legal_rationale: "Electronic integrated circuit assembly functioning as a tensor computation accelerator.",
        confidence: 0.98,
        passed: true,
        competing_candidates: ["Chapter 84 (Heading 8471 ADP Machines)"],
      },
      {
        step_rule: "GRI 1 / Note 5(E)",
        heading_or_subheading: "Heading 8542",
        description: "Electronic integrated circuits and microassemblies",
        legal_rationale: "Chapter 84 Note 5(E) directs that electronic acceleration coprocessor cards are classified in their own heading. Heading 8542 specifically covers processors and controllers.",
        confidence: 0.97,
        passed: true,
        competing_candidates: ["8473.30 (Parts and accessories of the machines of heading 8471)"],
      },
      {
        step_rule: "GRI 6",
        heading_or_subheading: "Subheading 8542.31",
        description: "Processors and controllers, whether or not combined with memories, converters, logic circuits",
        legal_rationale: "The neural processing core executes programmable arithmetic and matrix tensor multiplication.",
        confidence: 0.96,
        passed: true,
        competing_candidates: ["8542.32 (Memories)", "8542.39 (Other)"],
      },
      {
        step_rule: "Statutory Suffix",
        heading_or_subheading: "8542.31.0001",
        description: "Electronic integrated circuits: Processors: Microprocessors, having a 64-bit or greater architecture",
        legal_rationale: "64-bit wide register addressing qualifies under statistical reporting number 0001.",
        confidence: 0.95,
        passed: true,
        competing_candidates: [],
      },
    ],
    landed_cost: {
      entered_value: "120000.00",
      duty_rate_ad_valorem: "0.000",
      customs_duty: "0.00",
      mpf_rate: "0.003464",
      mpf_min_cap: "31.67",
      mpf_max_cap: "614.35",
      mpf_fee: "415.68",
      hmf_rate: "0.00125",
      hmf_fee: "150.00",
      freight_and_insurance: "3200.00",
      total_customs_cost: "565.68",
      total_landed_cost: "123765.68",
    },
  },
  ev_battery_pack: {
    item_id: "hts-ev_battery_pack",
    product_title: "Lithium Iron Phosphate (LiFePO4) Battery Module with Battery Management System (BMS)",
    input_description: "48V 100Ah modular lithium energy storage accumulator pack for solar and commercial power backup.",
    country_of_origin: "CN",
    declared_hts_code: "8504.40.9580",
    classified_hts_code: "8507.60.0000",
    confidence: 0.91,
    requires_human_review: false,
    chapter_notes_cited: [
      "Chapter 85 Note 2",
      "US Note 20 to Subchapter III, Chapter 99 (Section 301 Tariff on Chinese Lithium-Ion Accumulators)",
    ],
    gri_path: [
      {
        step_rule: "GRI 1",
        heading_or_subheading: "Heading 8507",
        description: "Electric storage batteries, including separators therefor, whether or not rectangular",
        legal_rationale: "Heading 8507 explicitly describes electric storage batteries and accumulators.",
        confidence: 0.98,
        passed: true,
        competing_candidates: ["8504.40 (Power Supplies)"],
      },
      {
        step_rule: "GRI 6",
        heading_or_subheading: "Subheading 8507.60",
        description: "Lithium-ion accumulators",
        legal_rationale: "Electrochemical cell chemistry is based on lithium iron phosphate intercalation.",
        confidence: 0.95,
        passed: true,
        competing_candidates: ["8507.20 (Other lead-acid accumulators)", "8507.80 (Other storage batteries)"],
      },
      {
        step_rule: "Statutory Suffix",
        heading_or_subheading: "8507.60.0000",
        description: "Lithium-ion accumulators (including battery packs and modules)",
        legal_rationale: "Complete modular pack assembly classified under 8507.60.0000.",
        confidence: 0.92,
        passed: true,
        competing_candidates: [],
      },
    ],
    landed_cost: {
      entered_value: "85000.00",
      duty_rate_ad_valorem: "0.034",
      customs_duty: "2890.00",
      mpf_rate: "0.003464",
      mpf_min_cap: "31.67",
      mpf_max_cap: "614.35",
      mpf_fee: "294.44",
      hmf_rate: "0.00125",
      hmf_fee: "106.25",
      freight_and_insurance: "2400.00",
      total_customs_cost: "3290.69",
      total_landed_cost: "90690.69",
    },
  },
  smart_apparel_watch: {
    item_id: "hts-smart_apparel_watch",
    product_title: "Multi-Sensor Fitness Tracking Smartband with Heart Rate Sensor & Bluetooth Low Energy",
    input_description: "Wearable wrist-worn fitness tracker with optical PPG biometric sensor, OLED display, and BLE sync.",
    country_of_origin: "VN",
    declared_hts_code: "9102.12.8000",
    classified_hts_code: "8517.62.0050",
    confidence: 0.81, // < 0.85 triggers visual uncertainty dashed amber border!
    requires_human_review: true,
    chapter_notes_cited: [
      "Chapter 90 Note 1(h) (Exclusion of smart wearables with primary data communication)",
      "Chapter 91 Note 1(n) (Exclusion of chronometers that are wireless transceivers)",
      "CBP Ruling HQ H258957 (Classification of wearable fitness devices)",
    ],
    gri_path: [
      {
        step_rule: "GRI 1 / GRI 3(b)",
        heading_or_subheading: "Heading 8517",
        description: "Telephone sets... other apparatus for the transmission or reception of voice, images or other data",
        legal_rationale: "Composite machine with optical heart rate monitor (Ch 90), time display (Ch 91), and BLE transmission (Ch 85). Essential character determined to be two-way wireless data connectivity.",
        confidence: 0.82,
        passed: true,
        competing_candidates: ["9031.80 (Measuring or checking instruments)", "9102.12 (Wristwatches with opto-electronic display)"],
      },
      {
        step_rule: "GRI 6",
        heading_or_subheading: "Subheading 8517.62",
        description: "Machines for the reception, conversion and transmission or regeneration of voice, images or other data",
        legal_rationale: "Device converts photoplethysmography sensor pulses into encrypted digital BLE packets.",
        confidence: 0.80,
        passed: true,
        competing_candidates: ["8517.69 (Other)"],
      },
      {
        step_rule: "Statutory Suffix",
        heading_or_subheading: "8517.62.0050",
        description: "Machines for the reception, conversion and transmission of data: Other",
        legal_rationale: "Qualified as other data communications hardware under 8517.62.0050.",
        confidence: 0.81,
        passed: true,
        competing_candidates: [],
      },
    ],
    landed_cost: {
      entered_value: "35000.00",
      duty_rate_ad_valorem: "0.000",
      customs_duty: "0.00",
      mpf_rate: "0.003464",
      mpf_min_cap: "31.67",
      mpf_max_cap: "614.35",
      mpf_fee: "121.24",
      hmf_rate: "0.00125",
      hmf_fee: "43.75",
      freight_and_insurance: "950.00",
      total_customs_cost: "164.99",
      total_landed_cost: "36114.99",
    },
  },
};

// -------------------------------------------------------------
// Pillar 4: CBP Assist & Valuation Register Mock Fixtures
// -------------------------------------------------------------
export const MOCK_ASSIST_ITEMS: AssistItem[] = [
  {
    id: "AST-2026-001",
    description: "Multi-Cavity Liquid Silicone Injection Tooling & Molds",
    category: "tooling_dies_molds",
    supplier_name: "Dongguan Precision Tooling Co., Ltd.",
    country_of_origin: "CN",
    total_acquisition_cost: "185000.00",
    anticipated_total_units: 100000,
    units_shipped_to_date: 15000,
    amortization_method: "units_produced",
    is_declared_to_cbp: false,
    per_unit_amortized_cost: "1.85",
    remaining_unamortized_cost: "157250.00",
  },
  {
    id: "AST-2026-002",
    description: "Custom ASIC Firmware & Overseas PCB Micro-Architecture Layout",
    category: "foreign_engineering_design",
    supplier_name: "Kyoto Micro-Embedded Labs",
    country_of_origin: "JP",
    total_acquisition_cost: "120000.00",
    anticipated_total_units: 60000,
    units_shipped_to_date: 10000,
    amortization_method: "units_produced",
    is_declared_to_cbp: false,
    per_unit_amortized_cost: "2.00",
    remaining_unamortized_cost: "100000.00",
  },
  {
    id: "AST-2026-003",
    description: "Specialized CNC Milling Fixtures & Progressive Stamping Dies",
    category: "tooling_dies_molds",
    supplier_name: "Bavaria Precision Machining GmbH",
    country_of_origin: "DE",
    total_acquisition_cost: "95000.00",
    anticipated_total_units: 50000,
    units_shipped_to_date: 50000,
    amortization_method: "first_entry",
    is_declared_to_cbp: true,
    per_unit_amortized_cost: "1.90",
    remaining_unamortized_cost: "0.00",
  },
];

export const MOCK_VALUATION_AUDIT: EntryValuationAudit = {
  entry_number: "CBP-7501-84920184",
  importer_of_record: "Pacific Tech Imports LLC (EIN 94-8291048)",
  declared_transaction_value: "450000.00",
  duty_rate_ad_valorem: "0.054",
  invoice_incoterm: "CIF Los Angeles",
  international_freight_in_invoice: "24500.00",
  marine_insurance_in_invoice: "3200.00",
  improper_cif_overvaluation: "27700.00",
  assists_omitted_cost: "57750.00",
  adjusted_lawful_dutiable_value: "480050.00",
  lawful_duty_due: "25922.70",
  declared_duty_paid: "24300.00",
  duty_underpayment: "1622.70",
  statutory_interest_19usc1505: "85.19",
  negligence_penalty_exposure: "3245.40",
  gross_negligence_penalty_exposure: "6490.80",
  prior_disclosure_tender_amount: "1707.89",
  total_liability_avoided: "4782.91",
  assists_audited: MOCK_ASSIST_ITEMS,
};

export const MOCK_PRIOR_DISCLOSURE: PriorDisclosurePackage = {
  filing_reference_id: "PD-84920184-20261114",
  port_of_entry: "Los Angeles / Long Beach (2704)",
  addressed_to: "Port Director & FP&F Officer, Port of Los Angeles / Long Beach (2704)",
  statutory_statutes_cited: [
    "19 U.S.C. § 1401a (Value of Merchandise)",
    "19 CFR § 152.103 (Transaction Value)",
    "19 U.S.C. § 1592(c)(4) (Prior Disclosure Mitigation)",
    "19 CFR § 162.74 (Prior Disclosure Procedures)",
    "19 U.S.C. § 1505 (Statutory Interest)",
  ],
  narrative_explanation: "Voluntary prior disclosure of omitted tooling and engineering assists on entry summary.",
  affected_entries: ["CBP-7501-84920184"],
  actual_duty_loss: "1622.70",
  interest_tender_amount: "85.19",
  total_tender_check: "1707.89",
  letter_text: `*** DRAFT -- PREPARED FOR REVIEW BY LICENSED CUSTOMS BROKER OR LEGAL COUNSEL ***

FORMAL PRIOR DISCLOSURE UNDER 19 CFR § 162.74
AND 19 U.S.C. § 1592(c)(4)

DATE: November 14, 2026
REFERENCE: PD-84920184-20261114

TO:
Port Director, U.S. Customs and Border Protection
Fines, Penalties, and Forfeitures Officer
Port of Los Angeles / Long Beach (2704)

FROM:
TradeTech Systems Studio / Automated Compliance Service
Prepared on Behalf of Importer of Record: Pacific Tech Imports LLC (EIN 94-8291048)

SUBJECT: Prior Disclosure of Inadvertent Valuation Understatement Pertaining to Assists
         Under 19 U.S.C. § 1401a and 19 CFR § 152.103 on Entry #CBP-7501-84920184

1. STATUTORY NOTICE OF VOLUNTARY DISCLOSURE
Pursuant to Section 592(c)(4) of the Tariff Act of 1930, as amended (19 U.S.C. § 1592(c)(4)),
and Section 162.74 of the Customs Regulations (19 CFR § 162.74), the Importer of Record
hereby formally discloses circumstances of a violation of 19 U.S.C. § 1592 prior to, or without
knowledge of, the formal commencement of an investigation by U.S. Customs and Border Protection.

2. AFFECTED MERCHANDISE AND ENTRY IDENTIFICATION
- Entry Number: CBP-7501-84920184
- Declared Transaction Value: $450,000.00 USD
- Port of Entry: Los Angeles / Long Beach (2704)
- Applicable HTS General Duty Rate: 5.40%

3. NARRATIVE EXPLANATION OF CIRCUMSTANCES
During an internal compliance review conducted via TradeTech Systems Studio's Autonomous
Valuation Ledger, the Importer identified that certain assists provided to the foreign manufacturer
(specifically tools, dies, molds, and foreign engineering design qualifying under 19 U.S.C. § 1401a(h)(1)(A))
were inadvertently omitted from the dutiable value declared upon entry.

Furthermore, commercial invoice review indicates that CIF ocean freight of $24,500.00
and marine insurance of $3,200.00 were improperly included in the entered
value contrary to 19 CFR § 152.103.

4. STATUTORY RECONCILIATION & MATHEMATICAL DETERMINATION (100% PYTHON DECIMAL)
- Declared Transaction Value:               $450,000.00
- Less: Excludable Ocean Freight/Insurance: -$27,700.00
- Plus: Unapportioned Statutory Assists:    +$57,750.00
-------------------------------------------------------------------------
- Adjusted Lawful Dutiable Value:           $480,050.00
- Lawful Customs Duty Due:                  $25,922.70
- Customs Duty Previously Tendered:         $24,300.00
-------------------------------------------------------------------------
- ACTUAL DUTY LOSS / UNDERPAYMENT:          $1,622.70
- STATUTORY INTEREST DUE (19 U.S.C. § 1505): $85.19
=========================================================================
- TOTAL TENDER CHECK ENCLOSED:              $1,707.89

5. PENALTY MITIGATION EFFECTUATION
Under 19 U.S.C. § 1592(c)(4), upon tender of the actual duty loss plus statutory interest,
all civil monetary penalties under 19 U.S.C. § 1592 (including gross negligence exposure of
$6,490.80) are statutorily barred.

Respectfully submitted,
TradeTech Systems Studio Compliance Automation Engine
Prepared on Behalf of Importer of Record: Pacific Tech Imports LLC (EIN 94-8291048)

*** DRAFT -- PREPARED FOR REVIEW BY LICENSED CUSTOMS BROKER OR LEGAL COUNSEL ***`,
};
