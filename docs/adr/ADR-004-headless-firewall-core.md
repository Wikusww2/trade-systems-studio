# ADR-004: Deep Headless Firewall Core & Multi-Variant UI Compiler

- **Status:** Accepted
- **Deciders:** Samuel (Principal Architect), TradeTech Governance
- **Date:** 2026-11-16
- **Technical Invariant:** Ousterhout Deep Module design, single `usePreIngestFirewall` facade hook, invariant `#arc` console, zero UI code duplication.

---

## Context
The TradeTech Systems Studio visual layer must support a tournament of 4 specialized UI paradigms (`#var-1` Swiss Hybrid Workbench, `#var-2` Operator Triage Queue, `#var-3` Kinetic 3D Narrative, `#var-4` Live Wiretap & Defense Console) plus a `#synthesis` arena. 

If each variation independently implements document bounding-box projection, audio haptic synthesis, PII redaction, resolution history, and replay fixture fallback, the frontend codebase degrades into a shallow, fragmented "ball of mud". Furthermore, deep links such as `/#arc` must remain canonical and invariant so visiting CTOs receive an uncompromised architectural defense experience regardless of switcher state.

## Decision
We extract a deep headless firewall core in `frontend-dashboard/src/lib/firewall-core/`:
1. **Deep Module Interface:** Adhering to John Ousterhout's *A Philosophy of Software Design*, `firewall-core` conceals coordinate projection, audio synthesis, PII masking, local fixture loading, and resolution state behind a single minimal facade hook:
   `usePreIngestFirewall()`
2. **Deterministic Offline Guarantee:** All variations function offline with zero API keys by replaying immutable `NightmareFixture` payloads.
3. **Canonical `#arc` Console:** When a user navigates to `/#arc`, the platform renders the invariant Architecture Defense & Wiretap Console, linking statutory claims directly to `docs/adr/`, backend Python line numbers, and passing `pytest` test runs.
4. **Top-Right Paradigm Switcher:** A persistent segmented header allows switching between `#var-1` through `#var-4` and `#synthesis` (`⌘1` to `⌘5`), updating the operational presentation without altering underlying statutory numbers.

## Consequences
- **Positive:** Variations remain thin visual views (< 350 lines each), mathematical determinism is strictly maintained across all layouts, and `#arc` serves as a stable, production-grade architectural artifact.
- **Negative:** Any change to core audit state interfaces must be backward-compatible with all 4 variation views.
- **Verification:** Verified via `npx tsc --noEmit`, `npm run build`, and headless Playwright visual regression gates.
