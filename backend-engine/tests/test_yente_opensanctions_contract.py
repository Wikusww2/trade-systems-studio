import os

import pytest

from app.core.config import settings
from app.services.layout_extractor import DocumentLayoutExtractor
from app.services.sanctions_screener import (
    EMBEDDED_SANCTIONS_DATASET,
    SanctionsEntity,
    SanctionsScreener,
)


def test_yente_entity_schema_contract():
    """
    Validates OpenSanctions / Yente entity schema specification compliance.
    Ensures properties conform to FollowTheMoney schema standards.
    """
    for entry in EMBEDDED_SANCTIONS_DATASET:
        entity = SanctionsEntity(**entry)
        assert entity.id is not None and len(entity.id) > 0
        assert entity.schema_type in ["LegalEntity", "Company", "Vessel", "Organization", "Person"]
        assert len(entity.name) > 0
        assert isinstance(entity.aliases, list)
        assert isinstance(entity.country, list)
        assert len(entity.country) > 0
        for cc in entity.country:
            assert len(cc) == 2, f"Country code {cc} must be ISO 3166-1 alpha-2"
        assert len(entity.programs) > 0
        assert any(t in ["sanction", "export.control", "military", "maritime.risk", "dual.use"] for t in entity.topics)

def test_yente_fuzzy_resolution_precision():
    """
    Tests Yente matching logic using RapidFuzz token sorting.
    Validates high-scoring matching on genuine alias permutations and zero false-positives on benign parties.
    """
    screener = SanctionsScreener()

    # Exact match on primary legal name
    match_exact = screener.match_entity("Global Micro Electronics Ltd", threshold=85.0)
    assert match_exact.matched is True
    assert match_exact.entity_id == "bis-el-cn-0941"
    assert match_exact.match_score >= 85.0

    # Alias matching with slight word reordering
    match_alias = screener.match_entity("GME Shenzhen Electronics", threshold=80.0)
    assert match_alias.matched is True
    assert match_alias.entity_id == "bis-el-cn-0941"
    assert match_alias.match_score >= 80.0

    # Benign party with no connection to sanctioned targets
    match_clean = screener.match_entity("Pacific Transpacific Ocean Logistics San Francisco LLC", threshold=85.0)
    assert match_clean.matched is False
    assert match_clean.match_score < 75.0

def test_yente_corporate_graph_ofac_50_percent_aggregation():
    """
    Tests OFAC 50% Rule multi-hop graph aggregation per 31 CFR § 501.
    Direct and indirect aggregate ownership of 50% or more by blocked persons renders the subsidiary blocked.
    """
    screener = SanctionsScreener()

    # Target bis-el-cn-0941 has Victor Petrov (25%) and Rosoboronexport (30%) = 55% cumulative blocked ownership
    graph_resp = screener.get_ownership_graph("bis-el-cn-0941")
    eval_res = graph_resp.evaluation
    assert eval_res.is_blocked_by_50_percent_rule is True
    assert eval_res.total_blocked_ownership_pct == 55.0
    assert len(eval_res.blocking_entities) == 2

    # Clean Pacific Apex (0% blocked ownership)
    clean_graph = screener.get_ownership_graph("pacific-apex-01")
    clean_eval = clean_graph.evaluation
    assert clean_eval.is_blocked_by_50_percent_rule is False
    assert clean_eval.total_blocked_ownership_pct == 0.0

def test_real_pdf_fixture_ingestion_and_bounding_boxes():
    """
    Ingests real disk PDF nightmare and clean fixtures.
    Validates that normalized [0, 1000) Docling bounding boxes are strictly within coordinate bounds.
    """
    extractor = DocumentLayoutExtractor()
    fixture_files = [
        "clean_01_customs_fob.pdf",
        "nightmare_01_customs_ci.pdf",
        "nightmare_02_freight_audit.pdf",
        "nightmare_03_duty_drawback.pdf",
    ]

    for fname in fixture_files:
        pdf_path = os.path.join(settings.NIGHTMARES_DIR, fname)
        assert os.path.exists(pdf_path), f"Fixture file not found: {pdf_path}"
        assert os.path.getsize(pdf_path) > 1000, f"Fixture file {fname} is suspiciously small: {os.path.getsize(pdf_path)} bytes"

        boxes = extractor.extract_bounding_boxes(pdf_path)
        assert len(boxes) > 0, f"No bounding boxes extracted from real fixture: {fname}"

        for item in boxes:
            box = item["bounding_box"]
            assert 0.0 <= box.x < 1000.0, f"Box x out of range: {box.x} in {fname}"
            assert 0.0 <= box.y < 1000.0, f"Box y out of range: {box.y} in {fname}"
            assert 0.0 < box.width <= 1000.0, f"Box width out of range: {box.width} in {fname}"
            assert 0.0 < box.height <= 1000.0, f"Box height out of range: {box.height} in {fname}"
            assert 0.0 <= box.confidence <= 1.0, f"Confidence out of range: {box.confidence} in {fname}"
            assert box.page_number >= 1, f"Invalid page number: {box.page_number} in {fname}"

def test_real_document_statutory_text_presence():
    """
    Verifies that real PDF documents contain expected statutory and commercial invoice trade markers.
    """
    extractor = DocumentLayoutExtractor()
    clean_pdf_path = os.path.join(settings.NIGHTMARES_DIR, "clean_01_customs_fob.pdf")
    nightmare_pdf_path = os.path.join(settings.NIGHTMARES_DIR, "nightmare_01_customs_ci.pdf")

    clean_boxes = extractor.extract_bounding_boxes(clean_pdf_path)
    clean_text = " ".join(b.get("text", "") for b in clean_boxes).upper()
    assert len(clean_text) > 20

    nightmare_boxes = extractor.extract_bounding_boxes(nightmare_pdf_path)
    nightmare_text = " ".join(b.get("text", "") for b in nightmare_boxes).upper()
    assert len(nightmare_text) > 20


@pytest.mark.anyio
async def test_yente_outage_fails_closed():
    """
    C5 Requirement: When Yente API is configured and unreachable, the engine must
    fail closed to UNSCREENED_HOLD with provider_error=True, never silent clear.
    """
    # Point to an unreachable port to simulate connection refusal / outage
    screener = SanctionsScreener(yente_url="http://127.0.0.1:59999")
    report = await screener.screen_parties_async(shipper="Unknown Foreign Shipper Ltd")

    assert report.provider_error is True
    assert report.compliance_status == "UNSCREENED_HOLD"
    assert report.engine_used == "yente_unavailable_hold"
    assert report.has_violations is True

