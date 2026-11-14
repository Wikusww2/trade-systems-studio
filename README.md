# 🛡️ TradeTech Systems Studio — Autonomous Trade Intelligence & Customs Defense

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Console-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sssammyboyyy.github.io/trade-systems-studio/)
[![Whitepaper](https://img.shields.io/badge/Whitepaper-Interactive%20Edition-8b5cf6?style=for-the-badge&logo=googledocs&logoColor=white)](https://sssammyboyyy.github.io/trade-systems-studio/whitepaper/)
[![Scale](https://img.shields.io/badge/Benchmark-33k%20audits%2Fsec-059669?style=for-the-badge&logo=speedtest&logoColor=white)](https://github.com/sssammyboyyy/trade-systems-studio/blob/main/docs/PERFORMANCE_AND_SCALE_BENCHMARKS.md)
[![CI](https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/sssammyboyyy/trade-systems-studio/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Pytest-41%2F41%20Passing-10b981?style=for-the-badge&logo=pytest&logoColor=white)](#-automated-verification)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Architected by Samuel**  
> *Principal AI Systems Architect & Full-Stack TradeTech Lead*  
> **Interactive Live Audit Console:** [https://sssammyboyyy.github.io/trade-systems-studio/](https://sssammyboyyy.github.io/trade-systems-studio/)

---

## 🏛️ Executive Summary & Moat

Mid-market enterprise importers, customs brokerages, and freight forwarders lose **5% to 15% of total freight spend** to carrier billing leakage and face catastrophic **19 U.S.C. § 1592 CBP penalties ($100k–$2.4M+)** due to manual transcription defects and assist omissions.

Generic LLM prompt wrappers fail in regulated international trade because flat LLMs hallucinate tariff codes, perform inaccurate math on currency/unit conversions, and cannot withstand formal U.S. Customs and Border Protection (CBP) or Federal Maritime Commission (FMC) audits.

**TradeTech Systems Studio** solves this with an enterprise-grade, zero-budget architecture that pairs **statutory legal reasoning (WCO GRI 1–6, 19 U.S.C. § 1592, 19 CFR § 152.103, 31 CFR § 501)** with **strict mathematical determinism (Python `Decimal`)** and **local document layout parsing (`docling`)**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE ARCHITECTURAL MOAT                                 │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ Strict Determinism      │ 100% Python Decimal arithmetic; absolute ban on LLM math     │
│ Zero-Budget OCR         │ Local document layout parsing with [0, 1000) coordinates     │
│ Statutory Accuracy      │ Modeled on CBP 1592, 19 CFR 152.103, FMC 21-08, 19 USC 1313  │
│ Entity Resolution Graph │ OFAC 50% Rule recursive multi-tier ownership traversal       │
│ WCO GRI State Machine   │ Path-dependent 10-digit HTS reasoning with confidence gating │
│ Nightmare Suite UI      │ High-contrast dark mode + React-PDF dynamic coordinate sync  │
│ Offline Demo Guarantee  │ Zero external API key dependencies for core review           │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🎯 The Six Flagship Enterprise Pillars

### 1. Customs Compliance Firewall & 1592 Defense
- **Statutory Authority:** 19 U.S.C. § 1592 & 19 CFR § 152.103.
- **The Threat:** Missing marine insurance on CIF Los Angeles shipments, quantity-by-unit-price multiplication mismatches, and HTS code misclassifications (e.g. 8471.30 vs 8542.31).
- **The Defense:** Hierarchical classification evaluation computing exact statutory negligence penalty exposures:
  - **Negligence:** 0.25x – 2.0x lawful duty loss
  - **Gross Negligence:** 2.5x – 4.0x lawful duty loss
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
- **The Threat:** Blocked entities and SDN-listed oligarchs conceal ownership through complex, multi-tiered corporate holding structures where each subsidiary holds $<50\%$, but aggregated blocked ownership exceeds $50\%$.
- **The Defense:** Sub-200ms recursive graph traversal calculating cumulative blocked equity across ownership chains paired with RapidFuzz token-sort string screening against OpenSanctions datasets.

### 5. Autonomous Landed Cost & HTS Classification Copilot
- **Statutory Authority:** WCO General Rules of Interpretation (GRI 1–6) & 19 CFR § 24.23/24.
- **The Threat:** Flat LLM prompts guess 10-digit HTS codes in one shot, bypassing Chapter/Section Notes and generating indefensible entries that fail CBP regulatory audits.
- **The Defense:** Path-dependent hierarchical state machine evaluating candidate headings, checking Section notes, and executing element-wise confidence scoring. Low confidence ($Conf(e) < 0.85$) triggers dashed amber visual review gating for licensed customs brokers. Aggregates duty, MPF ($31.67–$614.35 caps), and HMF (0.125%) via Python `Decimal`.

### 6. CBP Assist & Valuation Register (19 CFR § 152.103)
- **Statutory Authority:** 19 U.S.C. § 1401a, 19 CFR § 152.103, and 19 CFR § 162.74 (Prior Disclosure).
- **The Threat:** Importers omit buyer-supplied molds, dies, and foreign engineering design assists, while improperly declaring CIF ocean freight and insurance in dutiable basis.
- **The Defense:** GAAP assist register supporting First Entry and Units Produced amortization methods, deducting non-dutiable logistics overhead, and generating formal 19 CFR § 162.74 Prior Disclosure filing packages that mitigate up to 4.0x penalties down to statutory interest only.

---

## 🏗️ Monorepo Architecture

```
trade-systems-studio/
├── backend-engine/              # High-Precision Python/FastAPI Compliance Engine
│   ├── app/
│   │   ├── api/endpoints.py     # REST endpoints (/audit, /metrics, /sanctions, /hts, /valuation)
│   │   ├── core/
│   │   │   ├── compliance_rules.py # 19 U.S.C. § 1592 & 19 CFR § 152.103 logic
│   │   │   ├── freight_rules.py    # Pre-payment freight audit rules
│   │   │   └── drawback_rules.py   # 19 U.S.C. § 1313 99% refund matcher
│   │   ├── models/
│   │   │   ├── schemas.py          # Strict Pydantic v2 schemas with [0, 1000) bboxes
│   │   │   ├── sanctions_graph.py  # OFAC 50% Rule node/edge graph schemas
│   │   │   ├── hts_models.py       # WCO GRI decision node & landed cost schemas
│   │   │   └── valuation_models.py # GAAP assist & Prior Disclosure schemas
│   │   ├── services/
│   │   │   ├── extractor.py        # Core audit engine & deterministic ground-truth
│   │   │   ├── layout_extractor.py # Docling layout parser with normalized coordinates
│   │   │   ├── sanctions_screener.py # RapidFuzz fuzzy matcher & recursive graph traversal
│   │   │   ├── hts_classifier.py   # Hierarchical WCO GRI 1-6 state machine
│   │   │   └── valuation_ledger.py # GAAP assist amortization & prior disclosure generator
│   │   └── data/nightmares/     # Ground-truth PDF fixtures with known statutory defects
│   ├── tests/                   # 41 automated test suites (pytest -v)
│   └── main.py
│
├── docs/                        # Executive Briefing & Architecture Dossiers
│   ├── SAMUEL_EXECUTIVE_RESUME.md               # ATS-optimized Principal Architect resume
│   ├── TRADETECH_SYSTEMS_ARCHITECTURE_WHITEPAPER.md # Technical deep dive across all 6 engines
│   ├── PERFORMANCE_AND_SCALE_BENCHMARKS.md      # p50/p95/p99 latency benchmarks (33k audits/sec)
│   ├── SYSTEM_DESIGN_INTERVIEW_DEFENSE.md       # Verbatim technical interview answers & proofs
│   ├── RECRUITER_SCREEN_ONE_PAGER.md            # Word-for-word phone screen reference dashboard
│   ├── TARGET_ACCOUNTS_AND_DECISION_MAKERS.md   # Challenger Sale outreach packs for Raft, Altana, Expedock
│   └── RECRUITER_BRIEFING_PACK.md               # Screener defense & positioning guide
│
├── outreach_campaign/           # 6 Tailored Executive Outreach Packs (Altana, Zonos, Raft, etc.)
├── scripts/                     # Automation & Outreach Dispatch Tools (sniper_dispatch.py)
│
├── frontend-dashboard/          # Next.js 15 App Router "Nightmare Suite" Console
│   ├── src/
│   │   ├── components/
│   │   │   ├── DualPaneAuditViewer.tsx   # Dual-pane synchronized audit console
│   │   │   ├── PdfOverlayCanvas.tsx     # Canvas-level PDF renderer with zoom-locked highlights
│   │   │   ├── DiscrepancyCard.tsx       # Interactive discrepancy cards with visual diffs
│   │   │   ├── SanctionsGraphViewer.tsx  # Interactive SVG corporate ownership network
│   │   │   ├── HtsClassifierViewer.tsx   # WCO GRI 1-6 decision tree & landed cost calculator
│   │   │   ├── CustomsValuationViewer.tsx # GAAP assist register & Prior Disclosure letter modal
│   │   │   ├── FilmTheaterModal.tsx      # HyperFrames broadcast film theater modal
│   │   │   ├── AmbientMotionBackground.tsx # Living depth layer with ghost statutes
│   │   │   └── RollingNumber.tsx         # Smooth counter animations for ROI metrics
│   │   └── lib/
│   │       ├── api.ts                   # API client with deterministic offline fallback
│   │       ├── audio.ts                 # Web Audio API micro-haptics
│   │       └── types.ts                 # Shared TypeScript contracts
│   └── public/
│       ├── film/                        # Broadcast keyframe snapshots
│       ├── nightmares/                  # Demo PDF fixtures
│       └── pdf.worker.min.mjs           # Local offline PDF.js worker
│
├── film/                        # HyperFrames HTML-to-Video Broadcast Film Composition
│   ├── frame.md                 # Design system spec & reverse iceberg story spine
│   ├── index.html               # Master 1920x1080 @ 30fps timeline
│   └── scenes/                  # 6 standalone cinematic scene compositions
│
├── .github/workflows/
│   └── deploy-pages.yml         # Automated GitHub Actions Pages deployment
├── AGENTS.md                    # Universal Agent Governance Contract
├── GEMINI.md                    # Architecture and Invariants specification
└── PORTFOLIO.md                 # Executive portfolio briefing & case study
```

---

## ⚡ Automated Verification

```bash
# 1. Verify Backend Engine (All 41 statutory tests pass with exit code 0)
cd backend-engine
pytest -v

# 2. Verify Frontend Production Static Export
cd frontend-dashboard
npm run build

# 3. Run Sub-Millisecond Concurrency Benchmark (3,000 Audits in <0.1s)
cd backend-engine
python benchmark.py
# Outputs p50/p95/p99 breakdown to docs/PERFORMANCE_AND_SCALE_BENCHMARKS.md
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

*Note: The frontend operates in deterministic zero-key fallback mode by default, allowing full review of all scenarios without active backend or cloud API keys.*

---

## 📬 Contact & Advisory Engagements

**Samuel**  
*Principal AI Systems Architect & TradeTech Lead*  
Available for high-stakes enterprise advisory sprints ($15k–$40k) and full-time principal roles ($160k–$260k+).
