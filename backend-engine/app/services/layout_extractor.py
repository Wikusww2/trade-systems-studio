import logging
import os
from typing import Any, Dict, List

from app.models.schemas import BoundingBox

logger = logging.getLogger(__name__)


class DocumentLayoutExtractor:
    """
    Local layout and bounding-box extractor.
    - Uses local docling parser if available.
    - Provides deterministic local fallback parser using pypdf geometry when docling is not installed.
    - Normalizes all coordinates into the [0, 1000) integer/float space.
    """
    def __init__(self):
        self._docling_available = False
        try:
            import docling  # type: ignore # noqa: F401
            self._docling_available = True
        except ImportError:
            self._docling_available = False

    @property
    def has_docling(self) -> bool:
        return bool(self._docling_available)

    def extract_bounding_boxes(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extracts layout regions from PDF and returns normalized [0, 1000) bounding boxes.
        """
        if not os.path.exists(pdf_path):
            return []

        # If docling is installed, invoke docling DocumentConverter
        if self._docling_available:
            try:
                from docling.document_converter import DocumentConverter  # type: ignore
                converter = DocumentConverter()
                result = converter.convert(pdf_path)
                boxes = []
                for item in result.document.iterate_items():
                    if hasattr(item, "prov") and item.prov:
                        for prov in item.prov:
                            if hasattr(prov, "bbox") and prov.bbox:
                                b = prov.bbox
                                # docling bounding box normalized to [0, 1000)
                                x_val = max(0.0, min(1000.0, float(b.l)))
                                y_val = max(0.0, min(1000.0, float(b.t)))
                                w_val = max(0.0, min(1000.0 - x_val, float(b.r - b.l)))
                                h_val = max(0.0, min(1000.0 - y_val, float(b.b - b.t)))
                                boxes.append({
                                    "text": getattr(item, "text", ""),
                                    "bounding_box": BoundingBox(
                                        x=x_val,
                                        y=y_val,
                                        width=w_val,
                                        height=h_val,
                                        page_number=int(getattr(prov, "page_no", 1)),
                                        confidence=0.95
                                    )
                                })
                if boxes:
                    return boxes
            except Exception as e:
                logger.warning("Docling extraction failed, falling back to pypdf: %s", e)

        # Deterministic local fallback parser via pypdf visitor_text
        boxes = []
        try:
            import pypdf
            reader = pypdf.PdfReader(pdf_path)
            for page_idx, page in enumerate(reader.pages):
                page_w = float(page.mediabox.width)
                page_h = float(page.mediabox.height)

                def _visitor(text, cm, tm, fontDict, fontSize):
                    stripped = text.strip()
                    if stripped:
                        f_size = fontSize or 10.0
                        x_val = max(0.0, min(990.0, (float(tm[4]) / page_w) * 1000.0))
                        y_val = max(0.0, min(990.0, ((page_h - float(tm[5]) - f_size) / page_h) * 1000.0))
                        w_val = max(5.0, min(1000.0 - x_val, (len(stripped) * f_size * 0.55 / page_w) * 1000.0))
                        h_val = max(5.0, min(1000.0 - y_val, (f_size * 1.25 / page_h) * 1000.0))
                        rx = round(x_val, 1)
                        ry = round(y_val, 1)
                        rw = round(min(1000.0 - rx, max(5.0, w_val)), 1)
                        rh = round(min(1000.0 - ry, max(5.0, h_val)), 1)
                        if rx + rw > 1000.0:
                            rw = round(1000.0 - rx, 1)
                        if ry + rh > 1000.0:
                            rh = round(1000.0 - ry, 1)
                        boxes.append({
                            "text": stripped,
                            "bounding_box": BoundingBox(
                                x=rx,
                                y=ry,
                                width=rw,
                                height=rh,
                                page_number=page_idx + 1,
                                confidence=0.95
                            )
                        })

                page.extract_text(visitor_text=_visitor)

            if not boxes:
                for page_idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    boxes.append({
                        "text": text[:200],
                        "bounding_box": BoundingBox(
                            x=50.0,
                            y=50.0,
                            width=900.0,
                            height=900.0,
                            page_number=page_idx + 1,
                            confidence=0.85
                        )
                    })
        except Exception as e:
            logger.error("pypdf extraction failed for %s: %s", pdf_path, e)

        return boxes

    async def extract_bounding_boxes_async(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Non-blocking async wrapper around synchronous layout extraction
        (docling DocumentConverter or pypdf geometry), running in asyncio thread pool.
        """
        import asyncio
        return await asyncio.to_thread(self.extract_bounding_boxes, pdf_path)

layout_extractor = DocumentLayoutExtractor()
