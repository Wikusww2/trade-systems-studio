# 🛡️ TradeTech Systems Studio — Autonomous Trade Intelligence & Customs Defense

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Console-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sssammyboyyy.github.io/trade-systems-studio/)
[![Tests](https://img.shields.io/badge/Pytest-27%2F27%20Passing-10b981?style=for-the-badge&logo=pytest&logoColor=white)](#-automated-verification)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Architected by Samuel**  
> *Principal AI Systems Architect & Full-Stack TradeTech Lead*  
> **Interactive Live Audit Console:** [https://sssammyboyyy.github.io/trade-systems-studio/](https://sssammyboyyy.github.io/trade-systems-studio/)

---

## 🏛️ Executive Summary & Moat

Mid-market enterprise importers and freight forwarders lose **5% to 15% of total freight spend** to carrier billing leakage and face catastrophic **19 U.S.C. § 1592 CBP penalties ($100k–$2.4M+)** due to manual transcription errors on customs declarations.

Generic LLM prompt wrappers fail in regulated international trade because flat LLMs hallucinate tariff codes, perform inaccurate math on currency/unit conversions, and cannot withstand formal U.S. Customs and Border Protection (CBP) or Federal Maritime Commission (FMC) audits.

**TradeTech Systems Studio** solves this with an enterprise-grade, zero-budget architecture that pairs **statutory legal reasoning (WCO GRI 1–6, 19 U.S.C. § 1592, 19 CFR § 152.103)** with **strict mathematical determinism (Python `Decimal`)** and **local document layout parsing (`docling`)**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE ARCHITECTURAL MOAT                                 │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ Strict Determinism      │ 100% Python Decimal arithmetic; absolute ban on LLM math     │
│ Zero-Budget OCR         │ Local document layout parsing with [0, 1000) coordinates     │
│ Statutory Accuracy      │ Modeled on CBP 1592, 19 CFR 152.103, FMC 21-08, 19 USC 1313  │
│ Nightmare Suite UI      │ High-contrast dark mode + React-PDF dynamic coordinate sync  │
│ Offline Demo Guarantee  │ Zero external API key dependencies for core review           │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🎯 The Three Core Defense Concepts

### 1. Customs Compliance Firewall (19 U.S.C. § 1592)
- **The Threat:** Missing marine insurance on CIF Los Angeles shipments, quantity-by-unit-price multiplication mismatches, and HTS code misclassifications (e.g. 8471.30 vs 8542.31).
- **The Defense:** Hierarchical classification evaluation computing exact statutory negligence penalty exposures:
  - **Negligence:** 0.25x – 2.0x lawful duty loss
  - **Gross Negligence:** 2.5x – 4.0x lawful duty loss
  - **Fraud:** Up to 100% domestic merchandise value
- **Outcome:** Catches statutory non-compliance before entry transmission into the Automated Commercial Environment (ACE).

### 2. Pre-Payment Freight Audit (FMC Docket No. 21-08)
- **The Threat:** Carriers tacking on unwarranted surcharges: unauthorized chassis splits ($175.00), inflated Fuel Surcharge Index (FSC billed at 28.5% vs published DOE/EIA index of 22.1%), and detention billed inside port free time.
- **The Defense:** Systematic pre-payment invoice interrogation against baseline ocean contract tariffs and weekly published fuel indices, automatically generating carrier dispute packets.

### 3. Duty Drawback Harvester (19 U.S.C. § 1313)
- **The Threat:** Over $2 Billion in statutory customs duty refunds goes unclaimed annually due to fragmented ERP data across import declarations and export manifests.
- **The Defense:** Deterministic matching of CBP Form 7501 Import Summaries to paired export Bills of Lading, calculating 99% statutory drawback refunds with line-item traceability.

---

## 🏗️ Monorepo Architecture

```
trade-systems-studio/
├── backend-engine/              # High-Precision Python/FastAPI Compliance Engine
│   ├── app/
│   │   ├── api/endpoints.py     # REST endpoints (/api/v1/audit/{concept}, /api/v1/metrics)
│   │   ├── core/
│   │   │   ├── compliance_rules.py # 19 U.S.C. § 1592 & 19 CFR § 152.103 logic
│   │   │   ├── freight_rules.py    # Pre-payment freight audit rules
│   │   │   └── drawback_rules.py   # 19 U.S.C. § 1313 99% refund matcher
│   │   ├── models/schemas.py    # Strict Pydantic v2 schemas with [0, 1000) bboxes
│   │   ├── services/
│   │   │   ├── document_parser.py  # Docling layout parser + deterministic fallback
│   │   │   └── gemini_service.py   # Structured outputs with gemini-3.8-flash
│   │   └── data/nightmares/     # Ground-truth PDF fixtures with known defects
│   ├── tests/                   # 27 automated test suites (pytest -v)
│   └── main.py
│
├── frontend-dashboard/          # Next.js 15 App Router "Nightmare Suite" Console
│   ├── src/
│   │   ├── components/
│   │   │   ├── DualPaneAuditViewer.tsx   # Dual-pane synchronized audit console
│   │   │   ├── PdfOverlayCanvas.tsx     # Canvas-level PDF renderer with zoom-locked highlights
│   │   │   ├── DiscrepancyCard.tsx       # Interactive discrepancy cards with visual diffs
│   │   │   ├── PenaltyExposureLadder.tsx # 19 U.S.C. § 1592 statutory risk visualization
│   │   │   ├── BilledVsLawfulDiff.tsx    # Tactile redline diff for financial reconciliation
│   │   │   ├── DifferentialistMatrix.tsx # Commodity OCR vs Trade Intelligence comparison
│   │   │   ├── ExecutiveDossierModal.tsx # Print-ready executive briefing dossier
│   │   │   ├── IcpPersonaSwitcher.tsx    # CFO vs General Counsel perspective switcher
│   │   │   └── RollingNumber.tsx         # Smooth counter animations for ROI metrics
│   │   └── lib/
│   │       ├── api.ts                   # API client with deterministic offline fallback
│   │       ├── assets.ts                # GitHub Pages dynamic path resolution
│   │       └── audio.ts                 # Web Audio API micro-haptics
│   └── public/
│       ├── nightmares/                  # Demo PDF fixtures
│       └── pdf.worker.min.mjs           # Local offline PDF.js worker
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
# 1. Verify Backend Engine (All 27 statutory tests pass with exit code 0)
cd backend-engine
pytest -v

# 2. Verify Frontend Production Static Export
cd frontend-dashboard
npm run build
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

*Note: The frontend operates in deterministic zero-key fallback mode by default, allowing full review of all three Nightmare scenarios without active backend or cloud API keys.*

---

## 📬 Contact & Advisory Engagements

**Samuel**  
*Principal AI Systems Architect & TradeTech Lead*  
Available for high-stakes enterprise advisory sprints ($15k–$40k) and full-time principal roles ($160k–$260k+).
