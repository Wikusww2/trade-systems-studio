from app.services.extractor import extractor_service, TradeDocumentExtractor

def get_extractor_service() -> TradeDocumentExtractor:
    return extractor_service
