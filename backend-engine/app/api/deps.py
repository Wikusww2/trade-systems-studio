from app.services.extractor import TradeDocumentExtractor, extractor_service


def get_extractor_service() -> TradeDocumentExtractor:
    return extractor_service
