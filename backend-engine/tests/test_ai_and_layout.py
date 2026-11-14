import os
from unittest.mock import MagicMock
from app.services.ai_classifier import TradeAIClassifier, DocumentRoute, GRIReasoningResult
from app.services.layout_extractor import DocumentLayoutExtractor
from app.core.config import settings

def test_offline_zero_key_fallback():
    classifier = TradeAIClassifier()
    # In offline test environment without GEMINI_API_KEY, is_online must be False
    assert not classifier.is_online or bool(classifier.api_key)
    # Must gracefully return None without raising exception
    route = classifier.route_document("Sample Commercial Invoice")
    if not classifier.is_online:
        assert route is None

def test_ai_classifier_structured_outputs():
    classifier = TradeAIClassifier()
    # Mock GenAI client to test structured output parsing
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = (
        '{"declared_hts": "8471.30.0100", "lawful_hts": "8542.31.0000", '
        '"gri_rules_applied": ["GRI 1", "GRI 6"], '
        '"classification_rationale": "GRI 1 requires classification according to terms of headings. Item is an integrated circuit processor under 8542.", '
        '"section_301_applicable": true, "confidence": 0.98}'
    )
    mock_client.models.generate_content.return_value = mock_response
    classifier.client = mock_client

    result = classifier.analyze_gri_classification(
        "High-Speed AI Core Processors",
        "8471.30.0100"
    )

    assert result is not None
    assert isinstance(result, GRIReasoningResult)
    assert result.lawful_hts == "8542.31.0000"
    assert "GRI 1" in result.gri_rules_applied
    assert result.confidence == 0.98

def test_document_routing_structured_outputs():
    classifier = TradeAIClassifier()
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = (
        '{"document_type": "commercial_invoice", '
        '"concept_id": "concept_1_customs", '
        '"confidence": 0.96, '
        '"summary": "Commercial invoice for electronic components shipped CIF Los Angeles"}'
    )
    mock_client.models.generate_content.return_value = mock_response
    classifier.client = mock_client

    route = classifier.route_document("Invoice text CIF Los Angeles")
    assert route is not None
    assert isinstance(route, DocumentRoute)
    assert route.concept_id == "concept_1_customs"
    assert route.confidence == 0.96

def test_layout_extractor_normalized_coordinates():
    extractor = DocumentLayoutExtractor()
    fixture_path = os.path.join(settings.NIGHTMARES_DIR, "nightmare_01_customs_ci.pdf")
    
    # If fixture exists, test coordinate extraction
    if os.path.exists(fixture_path):
        boxes = extractor.extract_bounding_boxes(fixture_path)
        assert len(boxes) > 0
        for box in boxes:
            bbox = box["bounding_box"]
            assert 0.0 <= bbox.x <= 1000.0
            assert 0.0 <= bbox.y <= 1000.0
            assert 0.0 <= bbox.width <= 1000.0
            assert 0.0 <= bbox.height <= 1000.0
