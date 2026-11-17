# 🛡️ TradeTech Systems Studio: Deterministic Trade Intelligence & Customs Defense

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Console-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sssammyboyyy.github.io/trade-systems-studio/)
[![Whitepaper](https://img.shields.io/badge/Whitepaper-Interactive%20Edition-8b5cf6?style=for-the-badge&logo=googledocs&logoColor=white)](https://sssammyboyyy.github.io/trade-systems-studio/whitepaper/)
[![Scale](https://img.shields.io/badge/Benchmark-33k%20audits%2Fsec-059669?style=for-the-badge&logo=speedtest&logoColor=white)](https://github.com/sssammyboyyy/trade-systems-studio/blob/main/docs/PERFORMANCE_AND_SCALE_BENCHMARKS.md)
[![CI](https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/sssammyboyyy/trade-systems-studio/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Pytest-87%2F87%20Passing-10b981?style=for-the-badge&logo=pytest&logoColor=white)](#-automated-verification)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Architected by Samuel Rencken**  
> *BCom in Economic Sciences (International Trade) | Principal Systems Architect*  
> **Interactive Live Audit Console:** [https://sssammyboyyy.github.io/trade-systems-studio/](https://sssammyboyyy.github.io/trade-systems-studio/)

---

## 🏛️ Executive Summary & Architectural Moat

Mid-market enterprise importers, customs brokerages, and global forwarders lose **5% to 15% of total freight spend** to carrier billing leakage and face severe **19 U.S.C. § 1592 civil penalties ($100k to $2.4M+)** caused by manual transcription defects and assist omissions.

Generic language model prompt wrappers fail in regulated international trade because probabilistic text generators hallucinate tariff subheadings, drift during currency and unit conversions, and fail formal U.S. Customs and Border Protection (CBP) or Federal Maritime Commission (FMC) audits.

**TradeTech Systems Studio** solves this with an enterprise pre-ingest architecture that pairs **statutory legal reasoning (WCO GRI 1 to 6, 19 U.S.C. § 1592, 19 CFR § 152.103, 31 CFR § 501)** with **strict mathematical determinism (Python `Decimal`)** and **local document layout parsing (`docling`)**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE ARCHITECTURAL MOAT                                 │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ Strict Determinism      │ 100% Python Decimal arithmetic; absolute ban on LLM math     │
│ Zero-Budget Extraction  │ Local document layout parsing with [0, 1000) coordinates     │
│ Statutory Accuracy      │ Modeled on CBP 1592, 19 CFR 152.103, FMC 21-08, 19 USC 1313  │
│ Entity Resolution Graph │ OFAC 50% Rule recursive multi-tier ownership traversal       │
│ WCO GRI State Machine   │ Path-dependent 10-digit HTS reasoning with confidence gating │
│ Dual-Stack Boundary     │ UniversalShipment XML (SOAP) + eAdaptor Next (REST/OAuth)    │
│ Nightmare Suite UI      │ High-contrast dark mode with React-PDF dynamic coordinate sync│
│ Offline Demo Guarantee  │ Zero external API key dependencies for core review           │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🎯 CargoWise 2026 Positioning Nuance

TradeTech Systems Studio acts as an **Upstream Pre-Ingest and Financial Exception Firewall** deployed ahead of your Transportation Management System (TMS).

1. **Value Pack Fee Avoidance:** Intercepts accessorial overbilling and customs valuation discrepancies before shipment data enters CargoWise, mitigating downstream WiseTech Value Pack fees ($19.95 / $9.95 per transaction effective December 1, 2025).
2. **Dual-Stack Boundary:** Supports both legacy UniversalShipment XML (SOAP) and eAdaptor Next (REST / OAuth 2.0 / JWT) formats without requiring legacy system deprecation.
3. **Audit-Ready Provenance:** Every finding binds directly to its legal statute and normalized bounding box, giving operations teams defensible evidence before releasing carrier disbursements or customs filings.

---

## 🔬 The Six Flagship Enterprise Engines

### 1. Customs Compliance Firewall & 1592 Defense
- **Statutory Authority:** 19 U.S.C. § 1592 & 19 CFR § 152.103.
- **The Threat:** Missing marine insurance on CIF Los Angeles shipments, quantity-by-unit-price multiplication mismatches, and HTS code misclassifications (e.g. 8471.30 vs 8542.31).
- **The Defense:** Hierarchical classification evaluation computing exact statutory penalty exposures:
  - **Negligence:** 0.25x to 2.0x lawful duty loss
  - **Gross Negligence:** 2.5x to 4.0x lawful duty loss
  - **Fraud:** Up to 100% domestic merchandise value
- **Outcome:** Catches statutory non-compliance before entry transmission into the Automated Commercial Environment (ACE).

### 2. Pre-Payment Freight Audit (FMC Docket No. 21-08)
- **Statutory Authority:** FMC Docket 21-08 & Ocean Shipping Reform Act (OSRA 2022).
- **The Threat:** Carriers tacking on unwarranted surcharges: unauthorized chassis splits ($175.00), inflated Fuel Surcharge Index (FSC billed at 28.5% vs published DOE/EIA index of 22.1%), and detention billed inside port free time.
- **The Defense:** Systematic pre-payment invoice interrogation against baseline ocean contract tariffs and weekly published fuel indices, automatically generating carrier dispute packets.

### 3. Duty Drawback Harvester (19 U.S.C. § 1313)
- **Statutory Authority:** 19 U.S.C. § 1313 Unused Merchandise & Manufacturing Drawback.
- **The Threat:** Over $2 Billion in statutory customs duty refunds goes unclaimed annually due to fragmented ERP data across import declarations and export manifests.
- **The Defense:** Deterministic matching of CBP Form 7501 Import Summaries to paired export Bills of Lading, calculating 99% statutory drawback refunds with line-item traceability.

### 4. Global Sanctions & Corporate Entity Resolution Graph
- **Statutory Authority:** 31 CFR § 501 / OFAC 50 Percent Rule.
- **The Threat:** Blocked entities and SDN-listed targets conceal ownership through complex, multi-tiered corporate holding structures where each subsidiary holds under 50%, but aggregated blocked ownership reaches or exceeds 50%.
- **The Defense:** Sub-200ms recursive graph traversal calculating cumulative blocked equity across ownership chains paired with RapidFuzz token-sort string screening against OpenSanctions schemas.

### 5. Autonomous Landed Cost & HTS Classification Copilot
- **Statutory Authority:** WCO General Rules of Interpretation (GRI 1 to 6) & 19 CFR § 24.23/24.
- **The Threat:** Single-turn LLM prompts guess 10-digit HTS codes in one shot, bypassing Chapter/Section Notes and generating indefensible entries that fail CBP regulatory audits.
- **The Defense:** Path-dependent hierarchical state machine evaluating candidate headings, checking Section notes, and executing element-wise confidence scoring. Low confidence (Confidence < 0.85) triggers visual review gating for licensed customs brokers. Aggregates duty, MPF ($31.67 to $614.35 statutory caps), and HMF (0.125%) via Python `Decimal`.

### 6. CBP Assist & Valuation Register (19 CFR § 152.103)
- **Statutory Authority:** 19 U.S.C. § 1401a, 19 CFR § 152.103, and 19 CFR § 162.74 (Prior Disclosure).
- **The Threat:** Importers omit buyer-supplied molds, dies, and foreign engineering design assists, while improperly declaring CIF ocean freight and insurance in dutiable basis.
- **The Defense:** GAAP assist register supporting First Entry and Units Produced amortization methods, deducting non-dutiable logistics overhead, and generating formal 19 CFR § 162.74 Prior Disclosure filing packages that mitigate penalties down to statutory interest only.

---

## 🏗️ Monorepo Architecture

```
trade-systems-studio/
├── backend-engine/              # High-Precision Python/FastAPI Compliance Engine
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # Extractor dependency injection
│   │   │   └── endpoints.py     # REST endpoints (/audit, /metrics, /sanctions, /hts, /valuation)
│   │   ├── core/
│   │   │   └── config.py        # Environment settings & static path resolution
│   │   ├── models/
│   │   │   ├── schemas.py          # Strict Pydantic v2 schemas with [0, 1000) bboxes
│   │   │   ├── sanctions_graph.py  # OFAC 50% Rule node/edge graph schemas
│   │   │   ├── hts_models.py       # WCO GRI decision node & landed cost schemas
│   │   │   ├── valuation_models.py # GAAP assist & Prior Disclosure schemas
│   │   │   └── nightmare.py        # Ground-truth scenario representations
│   │   ├── services/
│   │   │   ├── extractor.py        # Core audit engine & deterministic ground-truth
│   │   │   ├── layout_extractor.py # Docling layout parser with normalized coordinates
│   │   │   ├── sanctions_screener.py # RapidFuzz fuzzy matcher & recursive graph traversal
│   │   │   ├── hts_classifier.py   # Hierarchical WCO GRI 1-6 state machine
│   │   │   ├── valuation_ledger.py # GAAP assist amortization & prior disclosure generator
│   │   │   ├── cargowise_xml.py    # UniversalShipment XML generator
│   │   │   ├── customs_audit.py    # 19 U.S.C. § 1592 calculation engine
│   │   │   ├── freight_audit.py    # Pre-payment freight audit engine
│   │   │   ├── drawback_audit.py   # 19 U.S.C. § 1313 drawback engine
│   │   │   ├── ai_classifier.py    # Structured outputs classifier
│   │   │   └── fixture_generator.py# ReportLab synthetic PDF generator
│   │   └── data/nightmares/     # Ground-truth PDF fixtures with known statutory defects
│   ├── tests/                   # 87 automated tests across 14 test modules (pytest -v)
│   ├── benchmark.py             # Concurrency benchmarking suite (33,496 audits/sec)
│   ├── demo.py                  # CLI multi-statute evaluation tool
│   └── main.py
│
├── frontend-dashboard/          # Next.js 15 App Router "Nightmare Suite" Console
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with JetBrains Mono, Inter & Newsreader
│   │   │   ├── page.tsx         # Master page shell
│   │   │   └── globals.css      # OKLCH color tokens & high-contrast dark theme
│   │   ├── components/
│   │   │   ├── DualPaneAuditViewer.tsx   # Dual-pane synchronized audit console
│   │   │   ├── PdfOverlayCanvas.tsx     # Canvas-level PDF renderer with zoom-locked highlights
│   │   │   ├── DiscrepancyCard.tsx       # Interactive discrepancy cards with visual diffs
│   │   │   ├── SanctionsGraphViewer.tsx  # Interactive SVG corporate ownership network
│   │   │   ├── HtsClassifierViewer.tsx   # WCO GRI 1-6 decision tree & landed cost calculator
│   │   │   ├── CustomsValuationViewer.tsx # GAAP assist register & Prior Disclosure modal
│   │   │   ├── FilmTheaterModal.tsx      # HyperFrames broadcast film theater modal
│   │   │   ├── AmbientMotionBackground.tsx # Living depth layer with ghost statutes
│   │   │   ├── ArchitectThesis.tsx       # Principal architect statement signed by Samuel
│   │   │   ├── ParadigmSwitcher.tsx      # Multi-paradigm console switcher
│   │   │   └── ThreeWayResolutionBar.tsx # Triage resolution bar (Dismiss / Escalate / Settle)
│   │   ├── data/
│   │   │   └── mockData.ts              # Deterministic offline fixture datasets
│   │   └── lib/
│   │       ├── api.ts                   # API client with deterministic offline fallback
│   │       ├── assets.ts                # GitHub Pages asset prefix resolver
│   │       ├── audio.ts                 # Web Audio API dual-frequency micro-haptics
│   │       ├── clientAuditor.ts         # On-device client PDF parser
│   │       └── types.ts                 # Shared TypeScript contracts
│   └── public/
│       ├── film/                        # Keyframe snapshots
│       ├── nightmares/                  # Demo PDF fixtures
│       └── pdf.worker.min.mjs           # Local offline PDF.js worker
│
├── docs/                        # Executive Briefing & Architecture Dossiers
│   ├── SAMUEL_EXECUTIVE_RESUME.md               # ATS-optimized Principal Architect resume
│   ├── TRADETECH_SYSTEMS_ARCHITECTURE_WHITEPAPER.md # Technical deep dive across all 6 engines
│   ├── PERFORMANCE_AND_SCALE_BENCHMARKS.md      # Latency benchmarks (33k audits/sec, p99 <0.09ms)
│   ├── SYSTEM_DESIGN_INTERVIEW_DEFENSE.md       # Technical interview defense & proofs
│   ├── RECRUITER_SCREEN_ONE_PAGER.md            # Recruiter screen reference dashboard
│   ├── TARGET_ACCOUNTS_AND_DECISION_MAKERS.md   # Outreach dossiers for enterprise forwarders
│   └── CONSOLIDATED_RESEARCH_BRIEF.md           # Distilled trade intelligence brief
│
├── scripts/                     # Automation, CI verification & playwright test scripts
│   ├── check_em_dashes.py       # Automated zero em-dash governance gate
│   ├── run_e2e_playwright.py    # Desktop and mobile end-to-end DOM test
│   └── test_ultra_polish.py     # Live production verification script
│
├── .github/workflows/
│   ├── ci.yml                   # Enterprise CI pipeline: pytest matrix, lint & typecheck
│   └── deploy-pages.yml         # Automated GitHub Actions Pages deployment
├── AGENTS.md                    # Universal Agent Governance Contract
└── GEMINI.md                    # Architecture and Invariants specification
```

---

## ⚡ Automated Verification

```bash
# 1. Verify Backend Engine (All 87 statutory tests pass with exit code 0)
cd backend-engine
pytest -v

# 2. Verify Zero Em-Dash Governance Rule (Mandatory across all files)
cd ..
python scripts/check_em_dashes.py

# 3. Verify Frontend Production Typecheck & Static Export
cd frontend-dashboard
npx tsc --noEmit
npm run build

# 4. Run Sub-Millisecond Concurrency Benchmark (3,000 Audits in <0.1s)
cd ../backend-engine
python benchmark.py
# Sustained throughput: 33,496 audits/sec; p99 latency <0.09ms

# 5. Run Executive CLI Multi-Statute Suite Evaluation (<1s)
python demo.py
# Executes all statutory compliance audits with colorized telemetry
```

---

## 🚀 Running Locally

### Backend Setup
```bash
cd backend-engine
python -m venv .venv
# On Windows: .venv\Scripts\activate | On macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

*Note: The frontend operates in deterministic zero-key fallback mode by default, allowing full review of all scenarios without an active backend or cloud API keys.*

---

## 👤 The Principal Architect

**Samuel Rencken**  
*BCom in Economic Sciences (International Trade) | University of Pretoria*  
*Principal Systems Architect & Forward-Deployed TradeTech Lead*  

Samuel operates at the rare intersection of statutory trade legal mechanics (19 U.S.C. § 1592, 19 CFR § 152.103, WCO GRI 1 to 6) and deterministic, zero-drift systems engineering. TradeTech Systems Studio demonstrates how to replace fragile language model wrappers with mathematically verifiable, high-throughput pre-audit firewalls built for global supply chain scale.

- **Interactive Live Console:** [https://sssammyboyyy.github.io/trade-systems-studio/](https://sssammyboyyy.github.io/trade-systems-studio/)
- **Technical Whitepaper:** [https://sssammyboyyy.github.io/trade-systems-studio/whitepaper/](https://sssammyboyyy.github.io/trade-systems-studio/whitepaper/)
- **GitHub Monorepo:** [https://github.com/sssammyboyyy/trade-systems-studio](https://github.com/sssammyboyyy/trade-systems-studio)
