# ADR-002: Upstream Pre-Ingest Firewall & ComplianceWise Coexistence

- **Status:** Accepted
- **Deciders:** Samuel (Principal Architect), TradeTech Governance
- **Date:** 2026-11-16
- **Technical Invariant:** DualStackBoundary XPath filtering ahead of CargoWise eAdaptor, zero hard claim of legacy eAdaptor shutoff, ValuePackLeakage interception.

---

## Context
WiseTech Global's CargoWise is the dominant enterprise logistics operating system for global freight forwarders. On December 1, 2025, WiseTech enacted its per-transaction Value Pack fee structure:
- **$19.95** per FCL import shipment with domestic transport legs.
- **$9.95** per standalone customs entry transaction.

When forwarders ingest unvetted or dirty commercial documents, malformed `UniversalShipment` payloads trigger these per-transaction fees prematurely. Furthermore, once an erroneous entry is ingested into CargoWise, correcting it triggers administrative rework, potential customs penalties, and secondary transmission fees.

WiseTech offers an internal module called ComplianceWise. Competing directly inside CargoWise against native functionality creates resistance from logistics enterprise IT directors and requires complex embedded plugin certifications.

## Decision
We position `trade-systems-studio` strictly as an **Upstream Pre-Ingest Firewall** (`PreIngestFirewall`):
1. **Upstream Wedge:** The firewall operates as an external, deterministic pre-audit gatekeeper between the shipper/carrier ingress and CargoWise eAdaptor. It intercepts carrier accessorial overbilling (FMC Docket 21-08), assist omissions (19 CFR Section 152.103), and malformed payloads *before* eAdaptor ingestion.
2. **DualStackBoundary:** The engine supports both legacy SOAP XML and modern eAdaptor Next (REST, OAuth 2.0, JWT) via strict XPath filtering:
   `//UniversalShipment/Shipment/DataContext/DataTargetCollection/DataTarget/Type`
   We make zero claims regarding a hard legacy eAdaptor shutdown date, ensuring architectural longevity across legacy forwarder fleets and modern scale-ups.
3. **Quarantine Ingress Mode:** When `PreIngestFirewall` catches a low-confidence element (`Conf(e) < 0.85`) or a statutory defect, it defaults to **Asynchronous Quarantine (`HTTP 202 QUARANTINED`)** with a unique `audit_run_id`, preventing upstream TMS connector retry storms while routing the transaction to the `OwnerRoutedQueue` and `ThreeWayResolutionBar`.
4. **Clean Interchange Emission:** Only after automated validation or human-on-the-loop signoff does the firewall emit a validated `UniversalInterchange` XML/JSON envelope to eAdaptor.

## Consequences
- **Positive:** Protects forwarders from ValuePackLeakage ($19.95 / $9.95 per dirty file), guarantees clean audit records, and eliminates channel conflict with WiseTech by complementing ComplianceWise.
- **Negative:** Requires forwarders to route inbound document webhooks through the pre-ingest firewall prior to eAdaptor ingestion.
- **Verification:** Enforced via `tests/test_cargowise_xml.py` and `tests/test_edge_cases.py`.
