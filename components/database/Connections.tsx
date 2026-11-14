"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  categoryLabels,
  tableDetails,
  type ConnectionLink,
  type TableCategory,
  type TableColumnInfo,
} from "@/lib/database-info";

type ConnectionsProps = {
  names: Record<string, string>;
  links: ConnectionLink[];
  counts: Record<string, number>;
  columnsByTable: Record<string, TableColumnInfo[]>;
  initialTable?: string;
};

// Purposeful 3-column architectural layout so foreign-key curves flow cleanly left-to-right
const COLUMN_LAYOUT: string[][] = [
  ["kingdoms", "people", "places", "events", "historical_items"],
  [
    "kingdom_borders",
    "kingdom_capitals",
    "event_kingdoms",
    "event_places",
    "routes",
    "route_kingdoms",
    "item_kingdoms",
    "item_text_lines",
  ],
  ["information_sources", "sources", "images", "other_names"],
];

const NODE_W = 224;
const NODE_H = 52;

function computeNodePositions(): Record<string, { x: number; y: number; col: number }> {
  const pos: Record<string, { x: number; y: number; col: number }> = {};
  const colX = [40, 378, 716];
  const canvasH = 640;

  COLUMN_LAYOUT.forEach((group, colIdx) => {
    const totalH = group.length * NODE_H;
    const gap = Math.max(16, (canvasH - 60 - totalH) / Math.max(1, group.length - 1));
    const startY = Math.max(36, (canvasH - (totalH + gap * (group.length - 1))) / 2);
    group.forEach((id, rowIdx) => {
      pos[id] = {
        x: colX[colIdx],
        y: Math.round(startY + rowIdx * (NODE_H + gap)),
        col: colIdx,
      };
    });
  });
  return pos;
}

function findShortestPath(
  links: ConnectionLink[],
  start: string,
  end: string,
): { tables: string[]; hops: { a: string; b: string; detail: string }[] } | null {
  if (start === end) return { tables: [start], hops: [] };
  const queue: { current: string; tables: string[]; hops: { a: string; b: string; detail: string }[] }[] = [
    { current: start, tables: [start], hops: [] },
  ];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const item = queue.shift()!;
    for (const l of links) {
      let next: string | null = null;
      let detail = "";
      if (l.from_table === item.current && !visited.has(l.to_table)) {
        next = l.to_table;
        detail = `${l.from_table}.${l.from_column} → ${l.to_table}.${l.to_column}`;
      } else if (l.to_table === item.current && !visited.has(l.from_table)) {
        next = l.from_table;
        detail = `${l.to_table}.${l.to_column} ← ${l.from_table}.${l.from_column}`;
      }
      if (next) {
        const nextTables = [...item.tables, next];
        const nextHops = [...item.hops, { a: item.current, b: next, detail }];
        if (next === end) {
          return { tables: nextTables, hops: nextHops };
        }
        visited.add(next);
        queue.push({ current: next, tables: nextTables, hops: nextHops });
      }
    }
  }
  return null;
}

export function Connections({
  names,
  links,
  counts,
  columnsByTable,
  initialTable,
}: ConnectionsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(
    initialTable && names[initialTable] ? initialTable : "kingdoms",
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [pathTarget, setPathTarget] = useState<string>("");

  const positions = useMemo(() => computeNodePositions(), []);
  const focusTable = hovered ?? selected;

  const tracedPath = useMemo(() => {
    if (!pathTarget || !names[pathTarget]) return null;
    return findShortestPath(links, selected, pathTarget);
  }, [links, names, selected, pathTarget]);

  const activeSet = useMemo(() => {
    if (tracedPath) return new Set(tracedPath.tables);
    const s = new Set<string>([focusTable]);
    for (const l of links) {
      if (l.from_table === focusTable) s.add(l.to_table);
      if (l.to_table === focusTable) s.add(l.from_table);
    }
    return s;
  }, [focusTable, links, tracedPath]);

  const outgoing = links.filter((l) => l.from_table === selected);
  const incoming = links.filter((l) => l.to_table === selected);
  const selectedColumns = columnsByTable[selected] ?? [];
  const fkByColumn = new Map(outgoing.map((l) => [l.from_column, l]));

  const categories: TableCategory[] = ["core", "spatial", "relations"];

  return (
    <div className="mt-8 space-y-10">
      {/* Path Finder Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-paper-raised p-4 font-sans text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-ink">Trace relational path:</span>
          <label className="sr-only" htmlFor="trace-from">
            From list
          </label>
          <select
            id="trace-from"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border border-border bg-paper px-3 py-1.5 text-ink"
          >
            {Object.entries(names).map(([id, label]) => (
              <option key={id} value={id}>
                {label} ({id})
              </option>
            ))}
          </select>
          <span className="text-ink-muted">to</span>
          <label className="sr-only" htmlFor="trace-to">
            To list
          </label>
          <select
            id="trace-to"
            value={pathTarget}
            onChange={(e) => setPathTarget(e.target.value)}
            className="border border-border bg-paper px-3 py-1.5 text-ink"
          >
            <option value="">All direct connections</option>
            {Object.entries(names)
              .filter(([id]) => id !== selected)
              .map(([id, label]) => (
                <option key={id} value={id}>
                  {label} ({id})
                </option>
              ))}
          </select>
          {pathTarget && (
            <button
              type="button"
              onClick={() => setPathTarget("")}
              className="border border-border bg-paper px-2.5 py-1.5 text-xs text-ink-muted hover:border-ink hover:text-ink"
            >
              Clear path
            </button>
          )}
        </div>

        {tracedPath && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink">
            <span className="font-medium text-territory-selected">
              {tracedPath.hops.length === 0
                ? "Same table"
                : `${tracedPath.hops.length} ${tracedPath.hops.length === 1 ? "hop" : "hops"}:`}
            </span>
            {tracedPath.hops.map((hop, idx) => (
              <code
                key={idx}
                className="border border-territory-selected/40 bg-paper px-2 py-0.5 font-mono text-[11px] text-ink"
              >
                {hop.detail}
              </code>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Grid: Interactive Constellation SVG + Live Table Schema Inspector */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] items-start">
        <div className="space-y-6">
          {/* Interactive Schema Diagram */}
          <div className="overflow-x-auto border border-border bg-paper-raised p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 font-sans text-xs text-ink-muted">
              <span>
                Click any table node to inspect its foreign-key bridges and column schema
              </span>
              <span className="tabular-nums">
                {Object.keys(names).length} tables · {links.length} foreign-key constraints
              </span>
            </div>

            <svg
              viewBox="0 0 980 650"
              role="img"
              aria-label="Relational schema diagram showing how the 17 PostgreSQL tables connect via foreign keys."
              className="w-full min-w-[680px] select-none"
            >
              {/* Column Tier Headers inside SVG */}
              <text x="40" y="20" fontSize="11" fill="var(--bh-ink-muted)" fontWeight="500">
                Core historical entities
              </text>
              <text x="378" y="20" fontSize="11" fill="var(--bh-ink-muted)" fontWeight="500">
                PostGIS shapes &amp; relational bridges
              </text>
              <text x="716" y="20" fontSize="11" fill="var(--bh-ink-muted)" fontWeight="500">
                Provenance, sources &amp; media
              </text>

              {/* Foreign-Key Cubic Bézier Curves */}
              {links.map((link, i) => {
                const a = positions[link.from_table];
                const b = positions[link.to_table];
                if (!a || !b) return null;

                const isPathHop = tracedPath
                  ? tracedPath.hops.some(
                      (h) =>
                        (h.a === link.from_table && h.b === link.to_table) ||
                        (h.a === link.to_table && h.b === link.from_table),
                    )
                  : false;

                const isDirectActive =
                  !tracedPath &&
                  (link.from_table === focusTable || link.to_table === focusTable);
                const active = isPathHop || isDirectActive;

                const ax = a.col <= b.col ? a.x + NODE_W : a.x;
                const bx = a.col === b.col ? b.x + NODE_W : a.col < b.col ? b.x : b.x + NODE_W;
                const ay = a.y + NODE_H / 2;
                const by = b.y + NODE_H / 2;

                let d = "";
                if (a.col === b.col) {
                  const curveX = ax + 44;
                  d = `M ${ax} ${ay} C ${curveX} ${ay}, ${curveX} ${by}, ${bx} ${by}`;
                } else {
                  const midX = (ax + bx) / 2;
                  d = `M ${ax} ${ay} C ${midX} ${ay}, ${midX} ${by}, ${bx} ${by}`;
                }

                return (
                  <path
                    key={`${link.from_table}-${link.from_column}-${link.to_table}-${i}`}
                    d={d}
                    fill="none"
                    stroke={
                      active ? "var(--bh-territory-selected)" : "var(--bh-border)"
                    }
                    strokeWidth={active ? 2.2 : 1}
                    strokeOpacity={active ? 0.95 : 0.35}
                  />
                );
              })}

              {/* Interactive Table Nodes */}
              {Object.keys(names).map((id) => {
                const p = positions[id];
                if (!p) return null;
                const isSelected = id === selected;
                const isConnected = activeSet.has(id);
                const count = counts[id] ?? 0;

                return (
                  <g
                    key={id}
                    transform={`translate(${p.x}, ${p.y})`}
                    onClick={() => setSelected(id)}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                    opacity={isConnected ? 1 : 0.42}
                  >
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      fill={isSelected ? "var(--bh-paper)" : "var(--bh-paper-raised)"}
                      stroke={
                        isSelected
                          ? "var(--bh-territory-selected)"
                          : isConnected
                            ? "var(--bh-ink)"
                            : "var(--bh-border)"
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    {isSelected && (
                      <rect
                        x="0"
                        y="0"
                        width="5"
                        height={NODE_H}
                        fill="var(--bh-territory-selected)"
                      />
                    )}
                    <text
                      x="14"
                      y="22"
                      fontSize="13"
                      fontWeight="600"
                      fill="var(--bh-ink)"
                    >
                      {names[id]}
                    </text>
                    <text
                      x="14"
                      y="39"
                      fontSize="10.5"
                      fontFamily="monospace"
                      fill="var(--bh-ink-muted)"
                    >
                      {id}
                    </text>
                    <text
                      x={NODE_W - 12}
                      y="39"
                      textAnchor="end"
                      fontSize="10.5"
                      fill="var(--bh-ink-muted)"
                    >
                      {count.toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Accessible Category Button Grid */}
          <div aria-label="Lists in the database" className="space-y-5">
            {categories.map((cat) => {
              const catTables = Object.keys(names).filter(
                (t) => tableDetails[t]?.category === cat,
              );
              return (
                <div key={cat}>
                  <h3 className="mb-2 font-sans text-xs font-medium text-ink-muted">
                    {categoryLabels[cat].title}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {catTables.map((id) => {
                      const isSel = selected === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={isSel}
                          onClick={() => setSelected(id)}
                          className={`relative border px-3.5 py-3 text-left font-sans text-sm transition-colors ${
                            isSel
                              ? "border-territory-selected bg-paper-raised text-ink"
                              : "border-border bg-paper text-ink-muted hover:border-ink hover:text-ink"
                          }`}
                        >
                          {isSel && (
                            <motion.span
                              layoutId={shouldReduceMotion ? undefined : "conn-pill"}
                              className="absolute inset-x-0 top-0 h-0.5 bg-territory-selected"
                            />
                          )}
                          <div className="font-medium text-ink">{names[id]}</div>
                          <div className="mt-1 flex items-center justify-between text-xs text-ink-muted">
                            <code className="text-[11px] text-ash">{id}</code>
                            <span className="tabular-nums">
                              {(counts[id] ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Live Table Schema & Foreign-Key Inspector */}
        <section
          aria-live="polite"
          className="sticky top-6 border border-ink bg-paper-raised p-5 font-sans"
        >
          <div className="border-b border-border pb-4">
            <div className="flex items-baseline justify-between gap-2">
              <code className="text-xs text-ash">public.{selected}</code>
              <span className="text-xs tabular-nums font-medium text-ink-muted">
                {(counts[selected] ?? 0).toLocaleString()} records
              </span>
            </div>
            <h2 className="mt-1 font-display text-3xl text-ink">{names[selected]}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {tableDetails[selected]?.summary}
            </p>
            <div className="mt-4">
              <Link
                href={`/data?list=${selected}`}
                className="block w-full border border-ink bg-ink px-4 py-2 text-center text-xs text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                Browse {names[selected].toLowerCase()} in data ledger
              </Link>
            </div>
          </div>

          {/* Outgoing Foreign Keys */}
          <div className="mt-4 border-b border-border pb-4">
            <h3 className="text-xs font-medium text-ink">
              Outgoing foreign keys ({outgoing.length})
            </h3>
            {outgoing.length > 0 ? (
              <ul className="mt-2.5 space-y-2 text-xs">
                {outgoing.map((l) => (
                  <li
                    key={`${l.from_column}-${l.to_table}`}
                    className="flex items-center justify-between gap-2 border border-border bg-paper px-2.5 py-2"
                  >
                    <code className="text-[11px] text-ink">
                      {l.from_column} → {l.to_table}.{l.to_column}
                    </code>
                    <button
                      type="button"
                      onClick={() => setSelected(l.to_table)}
                      className="shrink-0 text-territory-selected underline underline-offset-2"
                    >
                      {names[l.to_table]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-ink-muted">
                Root table (does not reference another table).
              </p>
            )}
          </div>

          {/* Incoming Foreign Keys */}
          <div className="mt-4 border-b border-border pb-4">
            <h3 className="text-xs font-medium text-ink">
              Referenced by ({incoming.length})
            </h3>
            {incoming.length > 0 ? (
              <ul className="mt-2.5 space-y-2 text-xs">
                {incoming.map((l) => (
                  <li
                    key={`${l.from_table}-${l.from_column}`}
                    className="flex items-center justify-between gap-2 border border-border bg-paper px-2.5 py-2"
                  >
                    <code className="text-[11px] text-ink">
                      {l.from_table}.{l.from_column}
                    </code>
                    <button
                      type="button"
                      onClick={() => setSelected(l.from_table)}
                      className="shrink-0 text-territory-selected underline underline-offset-2"
                    >
                      {names[l.from_table]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-ink-muted">
                Leaf table (not referenced by other tables).
              </p>
            )}
          </div>

          {/* Column Schema */}
          <div className="mt-4">
            <h3 className="text-xs font-medium text-ink">
              Columns ({selectedColumns.length})
            </h3>
            <ul className="mt-2.5 max-h-72 space-y-1.5 overflow-y-auto pr-1 text-xs">
              {selectedColumns.map((col) => {
                const fk = fkByColumn.get(col.column_name);
                return (
                  <li
                    key={col.column_name}
                    className="flex items-center justify-between gap-2 border border-border/70 bg-paper px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <code className="truncate font-semibold text-ink">
                        {col.column_name}
                      </code>
                      {col.is_primary && (
                        <span className="border border-ink px-1 text-[10px] font-medium text-ink">
                          PK
                        </span>
                      )}
                      {fk && (
                        <span className="border border-territory-selected/60 px-1 text-[10px] text-territory-selected">
                          FK
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                      {col.type}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
