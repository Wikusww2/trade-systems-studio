"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Discrepancy } from "@/lib/types";
import { DocumentScannerBeam } from "./DocumentScannerBeam";
import { sound } from "@/lib/audio";
import { resolveAssetPath } from "@/lib/assets";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  FileText,
  AlertCircle,
  ExternalLink,
  Scan,
  Crosshair,
} from "lucide-react";

// Configure pdfjs worker to local bundled worker
if (typeof window !== "undefined") {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = resolveAssetPath("/pdf.worker.min.mjs");
  }
}

interface PdfOverlayCanvasProps {
  documentUrl: string;
  filename: string;
  discrepancies: Discrepancy[];
  activeDiscrepancyId: string | null;
  onHoverDiscrepancy: (id: string | null) => void;
  onClickDiscrepancy: (id: string) => void;
}

export const PdfOverlayCanvas: React.FC<PdfOverlayCanvasProps> = ({
  documentUrl,
  filename,
  discrepancies,
  activeDiscrepancyId,
  onHoverDiscrepancy,
  onClickDiscrepancy,
}) => {
  const [scale, setScale] = useState<number>(1.0);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(792 / 612); // Standard letter ratio
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Base canvas dimensions in pixels (matches 612 x 792 letter aspect ratio)
  const baseWidth = 612;

  // Determine source URL with fallback logic (favor same-origin static fixture for instant load)
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => {
    return resolveAssetPath(`/nightmares/${filename}`);
  });

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    // Prioritize direct static path to prevent Web Worker cross-origin sandbox latency
    setResolvedUrl(resolveAssetPath(`/nightmares/${filename}`));
    
    // Trigger cybernetic scanner sweep on document change
    setIsScanning(true);
    const scanTimer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(scanTimer);
  }, [filename]);

  const triggerManualScan = () => {
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 50);
  };

  // Responsive scale initialization for mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 640) {
          setScale(0.58); // Fit mobile viewport width comfortably
        } else if (window.innerWidth < 1024) {
          setScale(0.85); // Fit tablet viewport
        } else {
          setScale(1.0); // Full desktop size
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Zoom handlers
  const handleZoomIn = () => {
    sound.playTick();
    setScale((prev) => Math.min(prev + 0.15, 2.2));
  };
  const handleZoomOut = () => {
    sound.playTick();
    setScale((prev) => Math.max(prev - 0.15, 0.5));
  };
  const handleResetZoom = () => {
    sound.playTick();
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setScale(0.58);
    } else {
      setScale(1.0);
    }
  };

  // Auto-scroll to active bounding box when hovered or selected
  useEffect(() => {
    if (!activeDiscrepancyId) return;
    const activeBoxEl = document.getElementById(`bbox-${activeDiscrepancyId}`);
    if (activeBoxEl && containerRef.current) {
      activeBoxEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeDiscrepancyId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setHasError(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.warn("Primary PDF load notice, checking alternative stream:", err);
    if (documentUrl && documentUrl.startsWith("/api/")) {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      setResolvedUrl(`${apiBase}${documentUrl}`);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPageLoadSuccess = (page: any) => {
    if (page && page.width && page.height) {
      setPageAspectRatio(page.height / page.width);
    }
    setIsLoading(false);
  };

  const renderedWidth = baseWidth * scale;
  const renderedHeight = renderedWidth * pageAspectRatio;

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#262B35] overflow-hidden">
      {/* Canvas Top Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white dark:bg-[#14171E] border-b border-slate-200 dark:border-[#262B35] shrink-0">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
            {filename}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-[#2A2F3A] text-slate-600 dark:text-slate-400 shrink-0">
            PAGE 1 / {numPages}
          </span>
        </div>

        {/* Viewport Zoom Controls & Cybernetic Scan Trigger */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={triggerManualScan}
            title="Trigger Cybernetic Scanner Beam"
            className="flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded-sm font-mono text-[10px] uppercase font-bold transition-all shadow-xs"
          >
            <Scan className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Laser Scan</span>
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#202530] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-300 dark:border-[#262B35] rounded-sm"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 w-10 sm:w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#202530] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-300 dark:border-[#262B35] rounded-sm"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Fit Scale"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#202530] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-300 dark:border-[#262B35] rounded-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Scroll Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center items-start rectilinear-grid relative bg-slate-200/50 dark:bg-[#0B0D11]"
      >
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-800 overflow-hidden z-40">
            <div className="h-full bg-sky-500 animate-pulse w-1/3" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-[#14171E] border border-rose-400 dark:border-rose-900/40 max-w-md text-center my-auto rounded-sm shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mb-1">
              Document Stream Notice
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Unable to load PDF stream directly into Web Worker. Open the raw document below to review:
            </p>
            <a
              href={resolveAssetPath(`/nightmares/${filename}`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-[#202530] hover:bg-slate-800 text-xs font-mono text-white border border-slate-700 transition-colors rounded-sm"
            >
              <span>Inspect Raw Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div
            style={{
              width: `${renderedWidth}px`,
              height: `${renderedHeight}px`,
              position: "relative",
              transition: "width 0.1s ease-out, height 0.1s ease-out",
            }}
            className="shadow-xl shadow-slate-400/20 dark:shadow-2xl bg-white border border-slate-300 dark:border-slate-700 select-none shrink-0 rounded-xs overflow-hidden"
          >
            {/* Cybernetic Animated Laser Scanning Beam */}
            <DocumentScannerBeam
              isScanning={isScanning}
              onScanComplete={() => setIsScanning(false)}
            />

            {/* React-PDF Canvas Document Layer */}
            <Document
              file={resolvedUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="w-full h-full overflow-hidden"
            >
              <Page
                pageNumber={1}
                width={renderedWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={onPageLoadSuccess}
                className="w-full h-full"
              />
            </Document>

            {/* Dynamic Viewport Bounding-Box Overlay Layer */}
            <div className="absolute inset-0 pointer-events-auto">
              {discrepancies.map((disc) => {
                const bbox = disc.bounding_box;
                // Normalized coordinates [0, 1000) mapped dynamically to viewport pixels
                const left = (bbox.x / 1000) * renderedWidth;
                const top = (bbox.y / 1000) * renderedHeight;
                const width = (bbox.width / 1000) * renderedWidth;
                const height = (bbox.height / 1000) * renderedHeight;

                const isSelected = activeDiscrepancyId === disc.id;
                const isUncertain = disc.confidence < 0.85;

                // Color schemes based on severity for Light & Dark
                let borderColor = "border-rose-600 dark:border-rose-500";
                let bgColor = isSelected ? "bg-rose-500/25" : "bg-rose-500/12";
                let badgeBg = "bg-rose-600 text-white dark:bg-rose-600 dark:text-white";

                if (disc.severity === "opportunity") {
                  borderColor = "border-emerald-600 dark:border-emerald-500";
                  bgColor = isSelected ? "bg-emerald-500/25" : "bg-emerald-500/12";
                  badgeBg = "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white";
                } else if (disc.severity === "warning" || isUncertain) {
                  borderColor = "border-amber-600 dark:border-amber-500";
                  bgColor = isSelected ? "bg-amber-500/25" : "bg-amber-500/12";
                  badgeBg = "bg-amber-600 text-white dark:bg-amber-600 dark:text-white";
                }

                return (
                  <div
                    key={disc.id}
                    id={`bbox-${disc.id}`}
                    onMouseEnter={() => {
                      sound.playTick();
                      onHoverDiscrepancy(disc.id);
                    }}
                    onMouseLeave={() => onHoverDiscrepancy(null)}
                    onClick={() => {
                      sound.playLock();
                      onClickDiscrepancy(disc.id);
                    }}
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      position: "absolute",
                    }}
                    className={`cursor-pointer transition-all duration-150 border-2 ${borderColor} ${bgColor} ${
                      isUncertain ? "border-dashed" : "border-solid"
                    } ${
                      isSelected
                        ? "ring-2 ring-sky-500 dark:ring-sky-400 z-30 scale-[1.01]"
                        : "z-20 hover:scale-[1.005]"
                    }`}
                  >
                    {/* Pin Badge on top left of bounding box */}
                    <div
                      style={{
                        transform: "translateY(-100%)",
                      }}
                      className={`absolute left-0 top-0 text-[9px] font-mono font-bold px-1.5 py-0.5 whitespace-nowrap flex items-center gap-1 ${badgeBg} shadow-sm rounded-xs`}
                    >
                      {isUncertain && <AlertTriangle className="w-2.5 h-2.5" />}
                      <span>{disc.statutory_code}</span>
                      <span>•</span>
                      <span>{(disc.confidence * 100).toFixed(0)}%</span>
                    </div>

                    {/* Biometric Target Locked Indicator when active */}
                    {isSelected && (
                      <div className="absolute -bottom-5 right-0 bg-sky-950 text-sky-400 border border-sky-500 font-mono text-[8px] font-bold px-1 py-0.2 rounded-xs tracking-wider flex items-center gap-1 shadow-md">
                        <Crosshair className="w-2.5 h-2.5 animate-spin" />
                        <span>TARGET LOCKED</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
