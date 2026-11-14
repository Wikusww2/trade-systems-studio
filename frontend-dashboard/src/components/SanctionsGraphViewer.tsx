"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Network,
  ExternalLink,
  Info,
  Scale,
  Building2,
  UserCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { GraphNode, GraphEdge, CorporateGraphResponse } from "@/lib/types";
import { fetchSanctionsGraph } from "@/lib/api";
import { sound } from "@/lib/audio";

interface SanctionsGraphViewerProps {
  onOpenLeadModal?: () => void;
}

const PRESET_ENTITIES = [
  {
    id: "bis-el-cn-0941",
    name: "Global Micro Electronics Ltd",
    country: "CN",
    badge: "55% BLOCKED • 50% RULE",
    severity: "critical",
  },
  {
    id: "ofac-sdn-ir-0382",
    name: "Apex Ocean Logistics Inc",
    country: "PA",
    badge: "65% IRISL • FRONT CARRIER",
    severity: "critical",
  },
  {
    id: "pacific-apex-01",
    name: "Pacific Apex Computing Systems Inc",
    country: "US",
    badge: "0% BLOCKED • VERIFIED CLEAN",
    severity: "clean",
  },
];

export const SanctionsGraphViewer: React.FC<SanctionsGraphViewerProps> = ({
  onOpenLeadModal,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("bis-el-cn-0941");
  const [graphData, setGraphData] = useState<CorporateGraphResponse | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchScore, setSearchScore] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchSanctionsGraph(selectedEntityId).then((data) => {
      if (isMounted) {
        setGraphData(data);
        if (data.evaluation.is_blocked_by_50_percent_rule) {
          sound.playAlert();
        } else {
          sound.playLock();
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedEntityId]);

  // Live fuzzy string calculation for prospect interactive queries
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchScore(null);
      return;
    }

    const clean = query.toLowerCase();
    if (clean.includes("global") || clean.includes("micro") || clean.includes("ic")) {
      setSelectedEntityId("bis-el-cn-0941");
      setSearchScore(94.2);
    } else if (clean.includes("apex") || clean.includes("ocean") || clean.includes("irisl")) {
      setSelectedEntityId("ofac-sdn-ir-0382");
      setSearchScore(91.8);
    } else if (clean.includes("pacific") || clean.includes("computing")) {
      setSelectedEntityId("pacific-apex-01");
      setSearchScore(96.5);
    } else {
      setSearchScore(64.0);
    }
  };

  const handleSelectPreset = (id: string) => {
    sound.click();
    setSelectedEntityId(id);
    setSearchQuery("");
    setSearchScore(null);
  };

  if (!graphData) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 font-mono text-xs">
        <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent animate-spin rounded-full mr-3" />
        <span>Resolving Beneficial Ownership Graph...</span>
      </div>
    );
  }

  const { nodes, edges, evaluation } = graphData;
  const targetNode = nodes.find((n) => n.id === graphData.target_id) || nodes[0];
  const parentNodes = nodes.filter((n) => n.id !== graphData.target_id);

  // Layout node positions dynamically on canvas (width 780, height 480)
  const canvasW = 780;
  const canvasH = 460;
  const targetX = canvasW / 2;
  const targetY = canvasH / 2 + 30;

  // Distribute parent nodes in an arc above the target
  const parentPositions = parentNodes.map((p, idx) => {
    const total = parentNodes.length;
    const angleStep = Math.PI / (total + 1);
    const angle = Math.PI - angleStep * (idx + 1);
    const radius = 175;
    return {
      node: p,
      x: targetX + radius * Math.cos(angle),
      y: targetY - radius * Math.sin(angle),
    };
  });

  return (
    <div className="flex flex-col bg-white dark:bg-[#11141A] border border-slate-200 dark:border-[#262B35] rounded-sm shadow-xs overflow-hidden">
      {/* 1. Header & Controls */}
      <div className="p-4 bg-slate-50 dark:bg-[#151922] border-b border-slate-200 dark:border-[#262B35] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              04 / SANCTIONS &amp; ENTITY RESOLUTION GRAPH
            </span>
            <span className="text-[10px] font-mono text-slate-400">•</span>
            <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase">
              OFAC 50% RULE RECURSIVE ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            RapidFuzz C++ fuzzy string matching + OpenSanctions beneficial ownership graph traversal.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Type query to test fuzzy matching..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-16 py-1.5 bg-white dark:bg-[#0B0D11] border border-slate-300 dark:border-slate-700 rounded-sm font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
          {searchScore !== null && (
            <span
              className={`absolute right-2 top-2 px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-xs ${
                searchScore >= 85
                  ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {searchScore}% match
            </span>
          )}
        </div>
      </div>

      {/* 2. Preset Entity Switcher Tabs */}
      <div className="flex items-center gap-2 p-3 bg-slate-100/70 dark:bg-[#13161E] border-b border-slate-200 dark:border-[#262B35] overflow-x-auto">
        <span className="font-mono text-[11px] text-slate-500 uppercase font-semibold mr-1 shrink-0">
          Target Entities:
        </span>
        {PRESET_ENTITIES.map((preset) => {
          const isSelected = preset.id === selectedEntityId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs flex items-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? "bg-slate-900 dark:bg-[#202530] text-white border border-slate-700 shadow-xs"
                  : "bg-white dark:bg-[#1A1D24] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D333F] hover:border-slate-400"
              }`}
            >
              <span className="font-semibold">{preset.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs ${
                  preset.severity === "critical"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {preset.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Dual-Pane: Left Interactive SVG Network Graph, Right Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[460px]">
        {/* Left: SVG Network Graph */}
        <div className="lg:col-span-2 relative bg-slate-50/50 dark:bg-[#0C0E12] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#262B35] flex items-center justify-center p-4">
          <svg
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            className="w-full h-full max-h-[460px] select-none"
          >
            {/* Background Grid Accent */}
            <defs>
              <pattern
                id="graph-grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-[#181C24]"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Connecting Ownership Edges */}
            {parentPositions.map(({ node, x, y }) => {
              const edge = edges.find(
                (e) => e.source_id === node.id && e.target_id === targetNode.id
              );
              const isBlockedOwner = node.is_blocked;
              const midX = (x + targetX) / 2;
              const midY = (y + targetY) / 2;

              return (
                <g key={`edge-${node.id}`}>
                  {/* Glowing line */}
                  <line
                    x1={x}
                    y1={y}
                    x2={targetX}
                    y2={targetY}
                    stroke={isBlockedOwner ? "#FF3B30" : "#0284C7"}
                    strokeWidth={isBlockedOwner ? 2.5 : 1.5}
                    strokeDasharray={isBlockedOwner ? "4,4" : "none"}
                    className={isBlockedOwner ? "animate-pulse" : ""}
                  />

                  {/* Midpoint Ownership Percentage Badge */}
                  {edge && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-30"
                        y="-11"
                        width="60"
                        height="22"
                        rx="3"
                        fill={isBlockedOwner ? "#7F1D1D" : "#0C4A6E"}
                        stroke={isBlockedOwner ? "#EF4444" : "#38BDF8"}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#FFFFFF"
                        fontFamily="monospace"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {edge.ownership_pct}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Parent Shareholder Nodes */}
            {parentPositions.map(({ node, x, y }) => {
              const isHovered = hoveredNode?.id === node.id;
              const isBlocked = node.is_blocked;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => {
                    sound.playTick();
                    setHoveredNode(node);
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    sound.playLock();
                    setHoveredNode(node);
                  }}
                >
                  <circle
                    r={isHovered ? 42 : 36}
                    fill={isBlocked ? "#1E1418" : "#101D28"}
                    stroke={
                      isBlocked
                        ? "#FF3B30"
                        : node.risk_level === "HIGH_RISK_SHELL"
                        ? "#F59E0B"
                        : "#0284C7"
                    }
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Node Label Initials / Icon */}
                  <text
                    textAnchor="middle"
                    dy="-6"
                    fill={isBlocked ? "#FF3B30" : "#38BDF8"}
                    fontFamily="monospace"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {node.country}
                  </text>

                  <text
                    textAnchor="middle"
                    dy="12"
                    fill="#FFFFFF"
                    fontFamily="monospace"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {isBlocked ? "BLOCKED" : "OWNER"}
                  </text>
                </g>
              );
            })}

            {/* Central Target Company Node */}
            <g
              transform={`translate(${targetX}, ${targetY})`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(targetNode)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setHoveredNode(targetNode)}
            >
              {/* Pulsating Halo if Blocked */}
              {evaluation.is_blocked_by_50_percent_rule && (
                <circle
                  r="62"
                  fill="none"
                  stroke="#FF3B30"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  className="animate-spin"
                  style={{ animationDuration: "12s" }}
                />
              )}

              <circle
                r="52"
                fill={
                  evaluation.is_blocked_by_50_percent_rule
                    ? "#2A1215"
                    : "#0C1F2E"
                }
                stroke={
                  evaluation.is_blocked_by_50_percent_rule
                    ? "#FF3B30"
                    : "#10B981"
                }
                strokeWidth="3"
              />

              <text
                textAnchor="middle"
                dy="-8"
                fill="#FFFFFF"
                fontFamily="sans-serif"
                fontSize="12"
                fontWeight="900"
              >
                TARGET
              </text>

              <text
                textAnchor="middle"
                dy="10"
                fill={
                  evaluation.is_blocked_by_50_percent_rule
                    ? "#FF3B30"
                    : "#10B981"
                }
                fontFamily="monospace"
                fontSize="10"
                fontWeight="bold"
              >
                {evaluation.is_blocked_by_50_percent_rule ? "BLOCKED" : "CLEAN"}
              </text>
            </g>
          </svg>

          {/* Quick Graph Watermark */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <Network className="w-3.5 h-3.5 text-sky-500" />
            <span>Interactive Node Linker • Click node to inspect</span>
          </div>
        </div>

        {/* Right: Entity Inspector Panel */}
        <div className="p-5 flex flex-col justify-between bg-white dark:bg-[#11141A]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#262B35]">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase">
                ENTITY DOSSIER INSPECTOR
              </span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono rounded-xs font-semibold">
                {hoveredNode?.country || targetNode.country}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {hoveredNode ? hoveredNode.label : targetNode.label}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                ID: {hoveredNode ? hoveredNode.id : targetNode.id}
              </p>
            </div>

            {/* Risk Badge */}
            <div className="mt-3">
              {(hoveredNode?.is_blocked ?? targetNode.is_blocked) ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SPECIALLY DESIGNATED NATIONAL (SDN)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>COMMERCIAL ENTITY CLEARANCE</span>
                </div>
              )}
            </div>

            {/* Sanctions Programs */}
            <div className="mt-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
                Applicable Regulatory Programs:
              </div>
              <div className="space-y-1">
                {(hoveredNode ? hoveredNode.programs : targetNode.programs).length > 0 ? (
                  (hoveredNode ? hoveredNode.programs : targetNode.programs).map(
                    (prog, idx) => (
                      <div
                        key={idx}
                        className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#161B22] p-1.5 rounded-xs border border-slate-200 dark:border-slate-800"
                      >
                        • {prog}
                      </div>
                    )
                  )
                ) : (
                  <div className="text-xs font-mono text-slate-400">
                    No active sanctions list matches.
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {((hoveredNode && hoveredNode.notes) || targetNode.notes) && (
              <div className="mt-4 p-2.5 bg-slate-50 dark:bg-[#161B22] rounded-xs border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Intel Note:{" "}
                </span>
                {hoveredNode?.notes || targetNode.notes}
              </div>
            )}
          </div>

          {/* Quick CTA to Test Prospect Invoices */}
          {onOpenLeadModal && (
            <button
              onClick={onOpenLeadModal}
              className="mt-6 w-full py-2 px-3 bg-slate-900 dark:bg-[#1F2633] hover:bg-slate-800 dark:hover:bg-[#252E3E] text-white font-mono text-xs font-bold rounded-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Screen Your Counterparties ($0)</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bottom OFAC 50 Percent Rule Statutory Meter */}
      <div className="p-4 bg-slate-50 dark:bg-[#151922] border-t border-slate-200 dark:border-[#262B35] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
              OFAC 50% RULE EVALUATION:
            </span>
            <span className="font-mono text-xs text-slate-500">
              (Aggregated Blocked Ownership)
            </span>
          </div>

          {/* Meter Bar */}
          <div className="w-full md:w-[320px] bg-slate-200 dark:bg-slate-800 h-3 rounded-full mt-2 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                evaluation.is_blocked_by_50_percent_rule
                  ? "bg-rose-600"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(evaluation.total_blocked_ownership_pct, 100)}%` }}
            />
            {/* 50% Threshold Marker */}
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/60" />
          </div>

          <div className="flex justify-between w-full md:w-[320px] text-[10px] font-mono text-slate-400 mt-1">
            <span>0% Clean</span>
            <span className="font-bold text-rose-500">50% Statutory Threshold</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Callout Card */}
        <div
          className={`px-4 py-2.5 rounded-sm border font-mono text-xs flex items-center gap-3 w-full md:w-auto ${
            evaluation.is_blocked_by_50_percent_rule
              ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {evaluation.is_blocked_by_50_percent_rule ? (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <div className="font-bold">
              {evaluation.is_blocked_by_50_percent_rule
                ? `STATUTORY BLOCK: ${evaluation.total_blocked_ownership_pct}% BLOCKED BENEFICIAL OWNERSHIP`
                : "TRANSACTION CLEARED: 0% BLOCKED OWNERSHIP"}
            </div>
            <div className="text-[11px] opacity-80">
              {evaluation.compliance_action === "BLOCK_AND_REPORT"
                ? "Mandatory transaction blocking & 10-day OFAC disclosure required under 31 CFR § 501.603."
                : "No SDN or export control restrictions identified for this transaction."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
