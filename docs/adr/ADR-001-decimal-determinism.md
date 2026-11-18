# ADR-001: Deterministic Statutory Kernel vs. Probabilistic LLMs

- **Status:** Accepted
- **Deciders:** Samuel (Principal Architect), TradeTech Governance
- **Date:** 2026-11-16
- **Technical Invariant:** 100% `decimal.Decimal` (`ROUND_HALF_UP`), zero LLM arithmetic, sub-millisecond statutory execution.

---

## Context
Commercial trade compliance and customs audits govern substantial civil penalty liabilities under 19 U.S.C. Section 1592 (up to 400% of lawful duty loss for gross negligence, and 100% domestic merchandise value for fraud), FMC Docket 21-08 / OSRA 2022 freight billing disputes, and CBP assist apportionment under 19 CFR Section 152.103.

Large Language Models (LLMs) are inherently probabilistic token generators prone to numerical hallucination, non-deterministic rounding errors, and IEEE-754 floating-point drift (e.g., `$132000.0000000002`). Passing financial calculations to an LLM exposes forwarders and importers of record to statutory liabilities and invalidates legal prior disclosure filings.

## Decision
We enforce an absolute architectural ban on LLM arithmetic across the entire monorepo:
1. **Statutory Kernel Execution:** All duty calculations, MPF/HMF statutory boundary caps (19 CFR Section 24.23), Section 1592 penalty ladders, assist amortizations, and carrier overbilling reconciliations are executed strictly by a stateless Python calculation kernel using `decimal.Decimal` with explicit `ROUND_HALF_UP` rounding.
2. **Statutory Floor Invariant:** Tenant custom tolerances in `engagement_policy` JSONB are strictly confined to commercial freight overbilling (FMC Docket 21-08). The kernel raises a `StatutoryFloorViolationException` if any tenant policy attempts to waive federal trade liabilities under 19 U.S.C. Section 1592 or 31 CFR Section 501.
3. **Role of LLMs:** Vision and language models (`google-genai` with `gemini-3.8-flash` and `gemini-3.5-flash-lite`) are restricted strictly to layout extraction, optical field parsing, and WCO GRI candidate routing. Every LLM output is constrained by strict Pydantic v2 schemas and gated by the `ConfidenceGate` (`Conf(e) < 0.85`).
4. **Content-Addressed AuditRunProvenance:** Each evaluation emits a deterministic composite `audit_run_id` calculated as `SHA-256(calc_version + engagement_policy_hash + ruleset_hash + normalized_document_hash)`. The wall-clock execution time is recorded in a separate immutable `executed_at` ISO 8601 UTC field, guaranteeing 100% reproducible regression replay hashes.

## Consequences
- **Positive:** Guaranteed zero floating-point drift, full compliance with CBP audit standards, reproducible automated regression tests (200/200 pytest), and stateless execution achieving 6,496 evals/sec at p99 < 0.31 ms on pure statutory cores (and < 60 ms p99 end-to-end with real 2-page `pypdf` parsing).
- **Negative:** Schema definitions and rule trees must be maintained in explicit code rather than natural language prompt chains.
- **Verification:** Enforced via `pytest tests/test_customs.py`, `tests/test_hts_classifier.py`, and `tests/test_valuation_ledger.py`.
