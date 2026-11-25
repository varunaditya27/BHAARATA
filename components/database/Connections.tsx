"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  categoryLabels,
  tableDetails,
  type ConnectionLink,
  type TableCategory,
  type TableColumnInfo,
} from "@/lib/database-meta";

type ConnectionsProps = {
  names: Record<string, string>;
  links: ConnectionLink[];
  counts: Record<string, number>;
  columnsByTable: Record<string, TableColumnInfo[]>;
  initialTable?: string;
};

type ViewMode = "architecture" | "radial";

type NodeLayout = {
  x: number;
  y: number;
  column: number;
  width: number;
  height: number;
};

const NODE_POSITIONS: Record<string, { column: number; row: number }> = {
  // Column 0 — Core Entities & Primary Media
  kingdoms: { column: 0, row: 0 },
  people: { column: 0, row: 1 },
  places: { column: 0, row: 2 },
  events: { column: 0, row: 3 },
  historical_items: { column: 0, row: 4 },
  item_text_lines: { column: 0, row: 5 },
  images: { column: 0, row: 6 },
  sources: { column: 0, row: 7 },

  // Column 1 — Spatial Layers & Core Junctions
  kingdom_borders: { column: 1, row: 0 },
  kingdom_capitals: { column: 1, row: 1 },
  routes: { column: 1, row: 2 },
  route_kingdoms: { column: 1, row: 3 },
  event_kingdoms: { column: 1, row: 4 },
  event_places: { column: 1, row: 5 },

  // Column 2 — Epigraphy, Names & Provenance
  item_kingdoms: { column: 2, row: 0 },
  other_names: { column: 2, row: 1 },
  information_sources: { column: 2, row: 2 },
};

const CATEGORY_COLORS: Record<TableCategory, string> = {
  core: "#c01a3c",
  spatial: "#00a371",
  relations: "#ffb000",
};

function findShortestPath(
  links: ConnectionLink[],
  start: string,
  end: string
): {
  tables: string[];
  hops: { a: string; b: string; detail: string; fromCol: string; toCol: string }[];
} | null {
  if (start === end) return { tables: [start], hops: [] };

  const adj = new Map<
    string,
    { neighbor: string; detail: string; fromCol: string; toCol: string }[]
  >();
  for (const l of links) {
    if (!adj.has(l.from_table)) adj.set(l.from_table, []);
    if (!adj.has(l.to_table)) adj.set(l.to_table, []);
    adj.get(l.from_table)!.push({
      neighbor: l.to_table,
      detail: `${l.from_table}.${l.from_column} → ${l.to_table}.${l.to_column}`,
      fromCol: l.from_column,
      toCol: l.to_column,
    });
    adj.get(l.to_table)!.push({
      neighbor: l.from_table,
      detail: `${l.to_table}.${l.to_column} ← ${l.from_table}.${l.from_column}`,
      fromCol: l.to_column,
      toCol: l.from_column,
    });
  }

  const visited = new Set<string>([start]);
  const queue: {
    table: string;
    path: string[];
    hops: { a: string; b: string; detail: string; fromCol: string; toCol: string }[];
  }[] = [{ table: start, path: [start], hops: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of adj.get(current.table) ?? []) {
      if (visited.has(edge.neighbor)) continue;
      const nextPath = [...current.path, edge.neighbor];
      const nextHops = [
        ...current.hops,
        {
          a: current.table,
          b: edge.neighbor,
          detail: edge.detail,
          fromCol: edge.fromCol,
          toCol: edge.toCol,
        },
      ];
      if (edge.neighbor === end) {
        return { tables: nextPath, hops: nextHops };
      }
      visited.add(edge.neighbor);
      queue.push({ table: edge.neighbor, path: nextPath, hops: nextHops });
    }
  }
  return null;
}

function buildSqlJoinSnippet(
  path: {
    tables: string[];
    hops: { a: string; b: string; detail: string; fromCol: string; toCol: string }[];
  } | null
): string {
  if (!path || path.tables.length === 0) return "";
  if (path.tables.length === 1) {
    return `SELECT *\nFROM ${path.tables[0]}\nLIMIT 25;`;
  }
  const lines = [
    `SELECT ${path.tables[0]}.*, ${path.tables[path.tables.length - 1]}.*`,
    `FROM ${path.tables[0]}`,
  ];
  for (const hop of path.hops) {
    lines.push(`JOIN ${hop.b}`);
    lines.push(`  ON ${hop.a}.${hop.fromCol} = ${hop.b}.${hop.toCol}`);
  }
  lines.push("LIMIT 25;");
  return lines.join("\n");
}

export function Connections({
  names,
  links,
  counts,
  columnsByTable,
  initialTable,
}: ConnectionsProps) {
  const prefersReducedMotion = useReducedMotion();
  const allTables = useMemo(() => Object.keys(NODE_POSITIONS), []);
  const validInitial =
    initialTable && NODE_POSITIONS[initialTable] ? initialTable : "kingdoms";

  const [selected, setSelected] = useState<string>(validInitial);
  const [hovered, setHovered] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("architecture");
  const [pathTarget, setPathTarget] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<TableCategory | "all">("all");
  const [copiedSql, setCopiedSql] = useState(false);

  const activeTable = hovered ?? selected;

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(counts)),
    [counts]
  );

  // Architecture canvas geometry
  const archCanvas = useMemo(() => {
    const colX = [56, 392, 728];
    const nodeW = 216;
    const nodeH = 54;
    const rowGap = 76;
    const topY = 54;

    const layout: Record<string, NodeLayout> = {};
    for (const [name, pos] of Object.entries(NODE_POSITIONS)) {
      layout[name] = {
        x: colX[pos.column] ?? 56,
        y: topY + pos.row * rowGap,
        column: pos.column,
        width: nodeW,
        height: nodeH,
      };
    }

    return {
      width: 996,
      height: topY + 8 * rowGap + 24,
      layout,
      colX,
    };
  }, []);

  const directNeighbors = useMemo(() => {
    const incoming: ConnectionLink[] = [];
    const outgoing: ConnectionLink[] = [];
    const connectedSet = new Set<string>([activeTable]);

    for (const l of links) {
      if (l.from_table === activeTable) {
        outgoing.push(l);
        connectedSet.add(l.to_table);
      }
      if (l.to_table === activeTable) {
        incoming.push(l);
        connectedSet.add(l.from_table);
      }
    }
    return { incoming, outgoing, connectedSet };
  }, [activeTable, links]);

  const tracedPath = useMemo(() => {
    if (!pathTarget) return null;
    return findShortestPath(links, selected, pathTarget);
  }, [links, selected, pathTarget]);

  const tracedSet = useMemo(
    () => new Set(tracedPath?.tables ?? []),
    [tracedPath]
  );

  const tracedEdgeSet = useMemo(() => {
    const s = new Set<string>();
    if (!tracedPath) return s;
    for (const hop of tracedPath.hops) {
      s.add(`${hop.a}->${hop.b}`);
      s.add(`${hop.b}->${hop.a}`);
    }
    return s;
  }, [tracedPath]);

  const sqlSnippet = useMemo(
    () => buildSqlJoinSnippet(tracedPath),
    [tracedPath]
  );

  // Radial ego-graph layout centered on `selected`
  const radialGraph = useMemo(() => {
    const cx = 480;
    const cy = 285;
    const ringRadius = 198;

    const connected: {
      table: string;
      direction: "in" | "out";
      label: string;
    }[] = [];
    const seen = new Set<string>();

    for (const l of links) {
      if (l.from_table === selected && !seen.has(l.to_table)) {
        seen.add(l.to_table);
        connected.push({
          table: l.to_table,
          direction: "out",
          label: `${l.from_column} → ${l.to_column}`,
        });
      } else if (l.to_table === selected && !seen.has(l.from_table)) {
        seen.add(l.from_table);
        connected.push({
          table: l.from_table,
          direction: "in",
          label: `${l.from_column} → ${l.to_column}`,
        });
      }
    }

    const nodes = connected.map((item, idx) => {
      const angle =
        (idx / Math.max(1, connected.length)) * Math.PI * 2 - Math.PI / 2;
      return {
        ...item,
        x: cx + Math.cos(angle) * ringRadius,
        y: cy + Math.sin(angle) * ringRadius,
      };
    });

    return { cx, cy, ringRadius, nodes };
  }, [links, selected]);

  const selectedDetail = tableDetails[selected];
  const selectedColumns = columnsByTable[selected] ?? [];

  const fkColumnSet = useMemo(() => {
    const s = new Set<string>();
    for (const l of links) {
      if (l.from_table === selected) s.add(l.from_column);
    }
    return s;
  }, [links, selected]);

  async function handleCopySql() {
    if (!sqlSnippet) return;
    try {
      await navigator.clipboard.writeText(sqlSnippet);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 1800);
    } catch {
      // Ignore clipboard permission errors in restricted contexts
    }
  }

  return (
    <div className="space-y-6">
      {/* Control strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-paper-raised p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            View
          </span>
          <button
            type="button"
            onClick={() => setViewMode("architecture")}
            className={`border px-3 py-1.5 font-sans text-xs transition-colors ${
              viewMode === "architecture"
                ? "border-ink bg-ink text-paper"
                : "border-border bg-paper text-ink hover:bg-paper-deep"
            }`}
          >
            All lists
          </button>
          <button
            type="button"
            onClick={() => setViewMode("radial")}
            className={`border px-3 py-1.5 font-sans text-xs transition-colors ${
              viewMode === "radial"
                ? "border-ink bg-ink text-paper"
                : "border-border bg-paper text-ink hover:bg-paper-deep"
            }`}
          >
            Around {names[selected] ?? selected}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Layer
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`border px-2.5 py-1 font-sans text-[11px] transition-colors ${
              categoryFilter === "all"
                ? "border-ink bg-ink text-paper"
                : "border-border bg-paper text-ink-muted hover:text-ink"
            }`}
          >
            All (17)
          </button>
          {(Object.keys(categoryLabels) as TableCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setCategoryFilter((prev) => (prev === cat ? "all" : cat))
              }
              className={`flex items-center gap-1.5 border px-2.5 py-1 font-sans text-[11px] transition-colors ${
                categoryFilter === cat
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper text-ink-muted hover:text-ink"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {categoryLabels[cat].title}
            </button>
          ))}
        </div>
      </div>

      {/* Main workspace: blueprint canvas + schema & SQL join inspector */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Dark archival blueprint canvas */}
        <div className="overflow-hidden border border-ink bg-ink text-paper">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper/15 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/65">
                {viewMode === "architecture"
                  ? `${allTables.length} Lists · ${links.length} Connections`
                  : `${names[selected] ?? selected} · ${radialGraph.nodes.length} direct links`}
              </span>
            </div>
            <span className="font-mono text-[11px] text-paper/60">
              Click any box to inspect it · Pick a second list to see how they connect
            </span>
          </div>

          <div className="overflow-x-auto p-3 sm:p-4">
            {viewMode === "architecture" ? (
              <svg
                viewBox={`0 0 ${archCanvas.width} ${archCanvas.height}`}
                className="h-auto w-full min-w-[780px] select-none"
                role="img"
                aria-label="Database table relationships diagram"
              >
                <defs>
                  <pattern
                    id="arch-grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="rgba(255,247,232, 0.06)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#ff5a3c" />
                  </marker>
                  <marker
                    id="arrow-trace"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#fff7e8" />
                  </marker>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width={archCanvas.width}
                  height={archCanvas.height}
                  fill="url(#arch-grid)"
                />

                {/* Column Headers */}
                {[
                  { x: archCanvas.colX[0], label: "01 · MAIN RECORDS & MEDIA" },
                  { x: archCanvas.colX[1], label: "02 · MAP SHAPES & LINKS" },
                  { x: archCanvas.colX[2], label: "03 · INSCRIPTIONS & SOURCES" },
                ].map((col) => (
                  <text
                    key={col.label}
                    x={col.x}
                    y={28}
                    fill="rgba(255,247,232, 0.55)"
                    fontSize="10"
                    letterSpacing="1.6"
                    className="font-mono"
                  >
                    {col.label}
                  </text>
                ))}

                {/* Foreign Key Bézier Edges */}
                {links.map((link) => {
                  const fromNode = archCanvas.layout[link.from_table];
                  const toNode = archCanvas.layout[link.to_table];
                  if (!fromNode || !toNode) return null;

                  const isTraced = tracedEdgeSet.has(
                    `${link.from_table}->${link.to_table}`
                  );
                  const isConnected =
                    link.from_table === activeTable ||
                    link.to_table === activeTable;

                  const sameCol = fromNode.column === toNode.column;
                  let d = "";
                  if (sameCol) {
                    const startX = fromNode.x;
                    const startY = fromNode.y + fromNode.height / 2;
                    const endX = toNode.x;
                    const endY = toNode.y + toNode.height / 2;
                    const swing = Math.min(44, Math.abs(endY - startY) * 0.35 + 20);
                    d = `M ${startX} ${startY} C ${startX - swing} ${startY}, ${endX - swing} ${endY}, ${endX} ${endY}`;
                  } else {
                    const leftToRight = fromNode.x < toNode.x;
                    const startX = leftToRight
                      ? fromNode.x + fromNode.width
                      : fromNode.x;
                    const startY = fromNode.y + fromNode.height / 2;
                    const endX = leftToRight
                      ? toNode.x
                      : toNode.x + toNode.width;
                    const endY = toNode.y + toNode.height / 2;
                    const midX = (startX + endX) / 2;
                    d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  }

                  const stroke = isTraced
                    ? "#fff7e8"
                    : isConnected
                      ? "#ff5a3c"
                      : "rgba(255,247,232, 0.14)";

                  return (
                    <g
                      key={`${link.from_table}.${link.from_column}->${link.to_table}.${link.to_column}`}
                    >
                      <path
                        d={d}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={isTraced ? 2.4 : isConnected ? 1.8 : 1}
                        markerEnd={
                          isTraced
                            ? "url(#arrow-trace)"
                            : isConnected
                              ? "url(#arrow-active)"
                              : undefined
                        }
                      />
                      {(isConnected || isTraced) && !prefersReducedMotion && (
                        <motion.path
                          d={d}
                          fill="none"
                          stroke={isTraced ? "#ffbe0b" : "#fffcf3"}
                          strokeWidth={1.6}
                          strokeDasharray="5 9"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: -28 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.4,
                            ease: "linear",
                          }}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Table Nodes */}
                {allTables.map((table) => {
                  const box = archCanvas.layout[table];
                  const detail = tableDetails[table];
                  if (!box || !detail) return null;

                  const count = counts[table] ?? 0;
                  const ratio = Math.max(
                    0.06,
                    Math.log10(count + 1) / Math.log10(maxCount + 1)
                  );

                  const isSelected = table === selected;
                  const isHovered = table === hovered;
                  const isNeighbor = directNeighbors.connectedSet.has(table);
                  const isTraced = tracedSet.has(table);
                  const matchesCat =
                    categoryFilter === "all" ||
                    detail.category === categoryFilter;

                  const dimmed =
                    !matchesCat ||
                    (tracedPath
                      ? !isTraced && !isSelected
                      : hovered
                        ? !isNeighbor
                        : false);

                  const accent = CATEGORY_COLORS[detail.category];

                  return (
                    <g
                      key={table}
                      transform={`translate(${box.x}, ${box.y})`}
                      onClick={() => setSelected(table)}
                      onMouseEnter={() => setHovered(table)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer", opacity: dimmed ? 0.34 : 1 }}
                    >
                      <rect
                        width={box.width}
                        height={box.height}
                        rx="2"
                        fill={
                          isSelected
                            ? "#fffcf3"
                            : isTraced
                              ? "#0b3d46"
                              : isHovered || isNeighbor
                                ? "#06242b"
                                : "#052a31"
                        }
                        stroke={
                          isSelected
                            ? "#ff5a3c"
                            : isTraced
                              ? "#ffbe0b"
                              : isNeighbor
                                ? "rgba(255,247,232, 0.5)"
                                : "rgba(255,247,232, 0.2)"
                        }
                        strokeWidth={isSelected || isTraced ? 2 : 1}
                      />

                      {/* Left category strip */}
                      <rect
                        x="0"
                        y="0"
                        width="4"
                        height={box.height}
                        fill={accent}
                      />

                      {/* Table human label */}
                      <text
                        x="14"
                        y="21"
                        fill={isSelected ? "#06242b" : "#fff7e8"}
                        fontSize="12"
                        fontWeight="600"
                        className="font-sans"
                      >
                        {names[table] ?? table}
                      </text>

                      {/* Physical SQL name + row count */}
                      <text
                        x="14"
                        y="38"
                        fill={
                          isSelected
                            ? "rgba(6,36,43, 0.65)"
                            : "rgba(255,247,232, 0.58)"
                        }
                        fontSize="10"
                        className="font-mono"
                      >
                        {table}
                      </text>
                      <text
                        x={box.width - 10}
                        y="21"
                        textAnchor="end"
                        fill={
                          isSelected
                            ? "#c01a3c"
                            : "rgba(255,247,232, 0.8)"
                        }
                        fontSize="11"
                        className="font-mono"
                      >
                        {count.toLocaleString()}
                      </text>

                      {/* Proportional row volume bar */}
                      <rect
                        x="14"
                        y={box.height - 8}
                        width={box.width - 24}
                        height="2.5"
                        fill={
                          isSelected
                            ? "rgba(6,36,43, 0.12)"
                            : "rgba(255,247,232, 0.1)"
                        }
                      />
                      <rect
                        x="14"
                        y={box.height - 8}
                        width={(box.width - 24) * ratio}
                        height="2.5"
                        fill={accent}
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <svg
                viewBox="0 0 960 570"
                className="h-auto w-full min-w-[700px] select-none"
                role="img"
                aria-label={`Radial ego-graph centered on ${selected}`}
              >
                <defs>
                  <pattern
                    id="radial-grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="rgba(255,247,232, 0.05)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="960" height="570" fill="url(#radial-grid)" />

                {/* Meridian orbital ring */}
                <circle
                  cx={radialGraph.cx}
                  cy={radialGraph.cy}
                  r={radialGraph.ringRadius}
                  fill="none"
                  stroke="rgba(255,247,232, 0.18)"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={radialGraph.cx}
                  cy={radialGraph.cy}
                  r={radialGraph.ringRadius * 0.52}
                  fill="none"
                  stroke="rgba(255,247,232, 0.08)"
                />

                {/* Spokes + FK labels */}
                {radialGraph.nodes.map((n) => {
                  const midX = (radialGraph.cx + n.x) / 2;
                  const midY = (radialGraph.cy + n.y) / 2;
                  const isOutgoing = n.direction === "out";
                  return (
                    <g key={`spoke-${n.table}-${n.label}`}>
                      <line
                        x1={radialGraph.cx}
                        y1={radialGraph.cy}
                        x2={n.x}
                        y2={n.y}
                        stroke={isOutgoing ? "#ff5a3c" : "#4cc3ff"}
                        strokeWidth={1.6}
                        strokeOpacity={0.75}
                      />
                      {!prefersReducedMotion && (
                        <motion.line
                          x1={radialGraph.cx}
                          y1={radialGraph.cy}
                          x2={n.x}
                          y2={n.y}
                          stroke="#fffcf3"
                          strokeWidth={1.3}
                          strokeDasharray="4 10"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{
                            strokeDashoffset: isOutgoing ? -28 : 28,
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "linear",
                          }}
                        />
                      )}
                      <rect
                        x={midX - 58}
                        y={midY - 9}
                        width="116"
                        height="18"
                        rx="2"
                        fill="#052a31"
                        stroke="rgba(255,247,232, 0.25)"
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        fill="#fff7e8"
                        fontSize="9"
                        className="font-mono"
                      >
                        {n.label.length > 21 ? `${n.label.slice(0, 19)}…` : n.label}
                      </text>
                    </g>
                  );
                })}

                {/* Neighbor nodes */}
                {radialGraph.nodes.map((n) => {
                  const detail = tableDetails[n.table];
                  const accent = detail
                    ? CATEGORY_COLORS[detail.category]
                    : "#ffb000";
                  return (
                    <g
                      key={`node-${n.table}`}
                      transform={`translate(${n.x - 86}, ${n.y - 25})`}
                      onClick={() => setSelected(n.table)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        width="172"
                        height="50"
                        rx="2"
                        fill="#06242b"
                        stroke="rgba(255,247,232, 0.45)"
                        strokeWidth="1.2"
                      />
                      <rect x="0" y="0" width="4" height="50" fill={accent} />
                      <text
                        x="12"
                        y="20"
                        fill="#fff7e8"
                        fontSize="11.5"
                        fontWeight="600"
                        className="font-sans"
                      >
                        {names[n.table] ?? n.table}
                      </text>
                      <text
                        x="12"
                        y="36"
                        fill="rgba(255,247,232, 0.65)"
                        fontSize="9.5"
                        className="font-mono"
                      >
                        {n.direction === "out" ? "→ " : "← "}
                        {n.table} ({(counts[n.table] ?? 0).toLocaleString()})
                      </text>
                    </g>
                  );
                })}

                {/* Center selected node */}
                <g
                  transform={`translate(${radialGraph.cx - 102}, ${radialGraph.cy - 32})`}
                >
                  <rect
                    width="204"
                    height="64"
                    rx="2"
                    fill="#fffcf3"
                    stroke="#ff5a3c"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="0"
                    y="0"
                    width="5"
                    height="64"
                    fill={
                      selectedDetail
                        ? CATEGORY_COLORS[selectedDetail.category]
                        : "#c01a3c"
                    }
                  />
                  <text
                    x="14"
                    y="25"
                    fill="#06242b"
                    fontSize="14"
                    fontWeight="700"
                    className="font-display"
                  >
                    {names[selected] ?? selected}
                  </text>
                  <text
                    x="14"
                    y="44"
                    fill="rgba(6,36,43, 0.72)"
                    fontSize="10.5"
                    className="font-mono"
                  >
                    {selected} · {(counts[selected] ?? 0).toLocaleString()} rows
                  </text>
                </g>
              </svg>
            )}
          </div>
        </div>

        {/* Right inspector: selected table, columns, shortest-path SQL join */}
        <aside className="space-y-4">
          <div className="border border-border bg-paper-raised p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  {selectedDetail
                    ? categoryLabels[selectedDetail.category].title
                    : "Table"}
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink">
                  {names[selected] ?? selected}
                </h2>
                <p className="font-mono text-xs text-ink-soft">{selected}</p>
              </div>
              <span className="border border-border bg-paper px-2.5 py-1 font-mono text-xs text-ink">
                {(counts[selected] ?? 0).toLocaleString()} rows
              </span>
            </div>

            {selectedDetail && (
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                {selectedDetail.summary}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/data?list=${selected}`}
                className="border border-ink bg-ink px-3 py-1.5 font-sans text-xs text-paper transition-colors hover:border-territory-selected hover:bg-territory-selected"
              >
                Browse in /data →
              </Link>
              <button
                type="button"
                onClick={() =>
                  setViewMode((prev) =>
                    prev === "architecture" ? "radial" : "architecture"
                  )
                }
                className="border border-border bg-paper px-3 py-1.5 font-sans text-xs text-ink hover:bg-paper-deep"
              >
                {viewMode === "architecture"
                  ? "Focus on this list"
                  : "Show all lists"}
              </button>
            </div>
          </div>

          {/* Step-by-step link finder */}
          <div className="border border-border bg-paper-raised p-5">
            <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              How two lists connect
            </p>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              See how <span className="font-medium text-ink">{names[selected] ?? selected}</span>{" "}
              connects to another list:
            </p>

            <div className="mt-3 flex gap-2">
              <select
                value={pathTarget}
                onChange={(e) => setPathTarget(e.target.value)}
                aria-label="Second list to connect to"
                className="min-w-0 flex-1 border border-border bg-paper px-2.5 py-1.5 font-sans text-xs text-ink"
              >
                <option value="">Pick another list…</option>
                {allTables
                  .filter((t) => t !== selected)
                  .map((t) => (
                    <option key={t} value={t}>
                      {names[t] ?? t}
                    </option>
                  ))}
              </select>
              {pathTarget && (
                <button
                  type="button"
                  onClick={() => setPathTarget("")}
                  className="border border-border bg-paper px-2.5 py-1.5 font-sans text-xs text-ink-muted hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            {tracedPath && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs">
                  {tracedPath.tables.map((t, idx) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelected(t)}
                        className="border border-border bg-paper px-2 py-0.5 text-ink hover:border-ink"
                      >
                        {names[t] ?? t}
                      </button>
                      {idx < tracedPath.tables.length - 1 && (
                        <span className="text-territory-selected">→</span>
                      )}
                    </span>
                  ))}
                </div>

                <div className="border border-border bg-ink p-3 text-paper">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/65">
                      {tracedPath.hops.length}{" "}
                      {tracedPath.hops.length === 1 ? "step" : "steps"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="border border-paper/25 px-2 py-0.5 font-mono text-[10px] text-paper hover:bg-paper/10"
                    >
                      {copiedSql ? "Copied" : "Copy query"}
                    </button>
                  </div>
                  <ul className="space-y-1 font-sans text-xs text-paper/90">
                    {tracedPath.hops.map((hop) => (
                      <li key={`${hop.a}-${hop.b}`}>
                        <span className="font-medium text-paper">
                          {names[hop.a] ?? hop.a}
                        </span>{" "}
                        <span className="text-paper/65">matches</span>{" "}
                        <span className="font-medium text-paper">
                          {names[hop.b] ?? hop.b}
                        </span>{" "}
                        <span className="font-mono text-[10px] text-paper/55">
                          ({hop.fromCol} = {hop.toCol})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="border border-border bg-paper-raised p-5">
            <div className="flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Fields ({selectedColumns.length})
              </p>
              <p className="font-mono text-[11px] text-ink-soft">
                {directNeighbors.incoming.length} in ·{" "}
                {directNeighbors.outgoing.length} out
              </p>
            </div>
            <ul className="mt-3 max-h-[260px] divide-y divide-border overflow-y-auto border-t border-border">
              {selectedColumns.map((col) => (
                <li
                  key={col.column_name}
                  className="flex items-center justify-between gap-2 py-2 font-mono text-xs"
                >
                  <span className="truncate text-ink">
                    {col.column_name}
                    {col.is_primary && (
                      <span className="ml-1.5 bg-territory-selected px-1 py-0.5 text-[9px] text-paper">
                        ID
                      </span>
                    )}
                    {fkColumnSet.has(col.column_name) && (
                      <span className="ml-1.5 bg-evidence px-1 py-0.5 text-[9px] text-paper">
                        Link
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-soft">
                    {col.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
