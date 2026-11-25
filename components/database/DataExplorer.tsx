"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { BrowserColumn } from "@/lib/database-browser";
import {
  categoryLabels,
  tableDetails,
  tableNames,
  type ConnectionLink,
  type TableCategory,
} from "@/lib/database-meta";

type DataExplorerProps = {
  selected: string;
  query: string;
  page: number;
  columns: BrowserColumn[];
  rows: Record<string, string | null>[];
  totalCount: number;
  pageSize: number;
  tableCounts: Record<string, number>;
  connections: ConnectionLink[];
};

const VISUAL_TABLES = new Set(["kingdoms", "people", "places", "images"]);

function recordAtlasLink(table: string, row: Record<string, string | null>) {
  if (!row.page_name) return null;
  const paths: Record<string, string> = {
    kingdoms: "/polities/",
    people: "/people/",
    places: "/places/",
    events: "/chronology#",
    historical_items: "/evidence/",
  };
  return paths[table] ? `${paths[table]}${encodeURIComponent(row.page_name)}` : null;
}

function columnLabel(name: string) {
  if (name === "id") return "Record ID";
  return name.replace(/_id$/, " ID").replaceAll("_", " ");
}

function formatCellText(value: string | null | undefined) {
  if (value === null || value === undefined) return "Not recorded";
  if (value === "") return "Empty";
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

function parsePointCoords(row: Record<string, string | null>): [number, number] | null {
  const raw = row.map_point || row.label_point;
  if (!raw) return null;
  const m = raw.match(/Point\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i);
  if (!m) return null;
  const lon = Number.parseFloat(m[1]);
  const lat = Number.parseFloat(m[2]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

function TableGlyph({ tableId }: { tableId: string }) {
  const cls = "h-4 w-4 shrink-0 text-ink-muted group-hover:text-ink";
  if (tableId === "kingdom_borders") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <polygon points="3,4 9,2 13,6 11,13 4,12" />
      </svg>
    );
  }
  if (tableId === "routes") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <path d="M2 12 C5 12, 5 4, 9 4 C12 4, 12 9, 14 9" strokeDasharray="2 1.5" />
        <circle cx="2.5" cy="12" r="1.3" fill="currentColor" />
        <circle cx="13.5" cy="9" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  if (tableId === "places") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z" />
        <circle cx="8" cy="6.5" r="1.4" />
      </svg>
    );
  }
  if (tableId === "people") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <circle cx="8" cy="5.2" r="2.6" />
        <path d="M3 13.5c.8-2.6 2.8-3.8 5-3.8s4.2 1.2 5 3.8" />
      </svg>
    );
  }
  if (tableId === "images") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <rect x="2" y="3" width="12" height="10" />
        <path d="M2.5 11.5 6 8l2.5 2.5L11 8l2.5 3.5" />
        <circle cx="5.5" cy="6" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  if (tableId === "kingdoms") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <path d="M2.5 12h11l-1-6.5-2.8 2.3L8 4 6.3 7.8 3.5 5.5 2.5 12Z" />
      </svg>
    );
  }
  if (tableId === "events") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 4.8v3.5l2.2 1.5" />
      </svg>
    );
  }
  if (tableId.includes("item") || tableId === "sources") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
        <rect x="3" y="2.5" width="10" height="11" />
        <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className={cls} aria-hidden>
      <circle cx="4.5" cy="8" r="2.2" />
      <circle cx="11.5" cy="8" r="2.2" />
      <path d="M6.7 8h2.6" />
    </svg>
  );
}

function CoordinateLocator({ lon, lat, label }: { lon: number; lat: number; label: string }) {
  // Map subcontinent bounds (60..95 E, 5..37 N) into SVG (0..280, 0..140)
  const x = Math.max(12, Math.min(268, ((lon - 60) / 35) * 256 + 12));
  const y = Math.max(12, Math.min(128, (1 - (lat - 5) / 32) * 116 + 12));

  return (
    <div className="mt-4 border border-border bg-ink p-3 text-paper">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-paper/70">
        <span>POSTGIS POINT LOCATOR</span>
        <span>
          {lat.toFixed(2)}°N, {lon.toFixed(2)}°E
        </span>
      </div>
      <svg viewBox="0 0 280 140" className="w-full" role="img" aria-label={`Coordinates ${lat.toFixed(2)}N, ${lon.toFixed(2)}E`}>
        {/* Graticule grid */}
        {[35, 70, 105].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2="280" y2={gy} stroke="#fffcf4" strokeOpacity="0.1" strokeWidth="0.7" />
        ))}
        {[56, 112, 168, 224].map((gx) => (
          <line key={gx} x1={gx} y1="0" x2={gx} y2="140" stroke="#fffcf4" strokeOpacity="0.1" strokeWidth="0.7" />
        ))}
        {/* Crosshair lines */}
        <line x1={x} y1="0" x2={x} y2="140" stroke="#ffb000" strokeOpacity="0.45" strokeDasharray="3 3" />
        <line x1="0" y1={y} x2="280" y2={y} stroke="#ffb000" strokeOpacity="0.45" strokeDasharray="3 3" />
        {/* Target pulse */}
        <circle cx={x} cy={y} r="10" fill="#d42b12" fillOpacity="0.28" />
        <circle cx={x} cy={y} r="4" fill="#d42b12" stroke="#fffcf4" strokeWidth="1.2" />
        <text
          x={x > 180 ? x - 10 : x + 10}
          y={y - 6 < 16 ? y + 12 : y - 6}
          textAnchor={x > 180 ? "end" : "start"}
          fontSize="9.5"
          fill="#fffcf4"
        >
          {label.slice(0, 26)}
        </text>
      </svg>
    </div>
  );
}

export function DataExplorer({
  selected,
  query,
  page,
  columns,
  rows,
  totalCount,
  pageSize,
  tableCounts,
  connections,
}: DataExplorerProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<"gallery" | "table">(
    VISUAL_TABLES.has(selected) ? "gallery" : "table",
  );
  const [showSchema, setShowSchema] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"fields" | "json">("fields");
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(rows.length > 0 ? 0 : null);
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  const totalCorpusRecords = Object.values(tableCounts).reduce((sum, n) => sum + n, 0);
  const maxTableCount = Math.max(1, ...Object.values(tableCounts));
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const detail = tableDetails[selected] ?? {
    category: "core" as TableCategory,
    summary: "",
  };

  // Corpus breakdown by category for visual distribution bar
  const categoryTotals = (["core", "spatial", "relations"] as TableCategory[]).map((cat) => {
    const count = Object.keys(tableNames)
      .filter((t) => tableDetails[t]?.category === cat)
      .reduce((sum, t) => sum + (tableCounts[t] ?? 0), 0);
    return { cat, label: categoryLabels[cat].title, count };
  });

  const orderedColumns = [...columns].sort((a, b) => {
    const score = (name: string) => {
      if (name === "id") return 0;
      if (["name", "title", "label", "name_text"].includes(name)) return 1;
      if (["kingdom_id", "person_id", "place_id", "event_id", "source_id"].includes(name)) return 2;
      if (["start_year", "from_year", "end_year", "to_year"].includes(name)) return 3;
      return 4;
    };
    return score(a.name) - score(b.name);
  });

  const tableColumns = (() => {
    const lowPriority = new Set([
      "provenance",
      "geo_json",
      "geometry",
      "slug",
      "hero_image_id",
      "image_id",
      "summary",
      "description",
      "notes",
      "uncertainty_note",
      "created_at",
      "updated_at",
      "accent_color",
    ]);
    const preferred = orderedColumns.filter((c) => !lowPriority.has(c.name));
    const list = preferred.length >= 3 ? preferred : orderedColumns;
    return list.slice(0, 5);
  })();

  const inspectedRow =
    inspectedIndex !== null && rows[inspectedIndex] ? rows[inspectedIndex] : null;
  const inspectedCoords = inspectedRow ? parsePointCoords(inspectedRow) : null;

  const incomingLinks = connections.filter((c) => c.to_table === selected);
  const categories: TableCategory[] = ["core", "spatial", "relations"];

  const handleCopyJson = (row: Record<string, string | null>) => {
    const clean = Object.fromEntries(
      Object.entries(row).filter(([k]) => !k.startsWith("_")),
    );
    navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      {/* Editorial Header + Visual Corpus Distribution */}
      <div className="border-b border-ink pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Browse all the data
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              Look through all 17 lists behind BHĀRATA, from kingdoms and rulers to map borders, places and images.
            </p>
          </div>
          <Link
            href="/connections"
            className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-sans text-sm text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            <span>See how the data connects</span>
            <span className="border border-paper/30 px-1.5 py-0.5 text-xs tabular-nums">
              {connections.length} links
            </span>
          </Link>
        </div>

        {/* Metrics + Visual Proportion Bar */}
        <div className="mt-7 grid gap-6 border-t border-border pt-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border-l-2 border-territory-selected pl-3">
              <dt className="font-sans text-xs text-ink-muted">Total entries</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
                {totalCorpusRecords.toLocaleString()}
              </dd>
            </div>
            <div className="border-l-2 border-ink pl-3">
              <dt className="font-sans text-xs text-ink-muted">Lists</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
                {Object.keys(tableNames).length}
              </dd>
            </div>
            <div className="border-l-2 border-evidence pl-3">
              <dt className="font-sans text-xs text-ink-muted">Map shapes</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
                {(
                  (tableCounts.kingdom_borders ?? 0) +
                  (tableCounts.places ?? 0) +
                  (tableCounts.events ?? 0) +
                  (tableCounts.routes ?? 0)
                ).toLocaleString()}
              </dd>
            </div>
            <div className="border-l-2 border-uncertainty pl-3">
              <dt className="font-sans text-xs text-ink-muted">Credited images</dt>
              <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
                {(tableCounts.images ?? 0).toLocaleString()}
              </dd>
            </div>
          </dl>

          {/* Proportional Composition Bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between font-sans text-xs text-ink-muted">
              <span>What&apos;s in the archive</span>
              <span className="tabular-nums">{totalCorpusRecords.toLocaleString()} total</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden border border-ink/20 bg-stone">
              {categoryTotals.map((item) => {
                const pct = totalCorpusRecords > 0 ? (item.count / totalCorpusRecords) * 100 : 0;
                const bg =
                  item.cat === "core"
                    ? "bg-territory-selected"
                    : item.cat === "spatial"
                      ? "bg-evidence"
                      : "bg-uncertainty";
                return (
                  <div
                    key={item.cat}
                    style={{ width: `${pct}%` }}
                    className={`${bg} h-full transition-all`}
                    title={`${item.label}: ${item.count.toLocaleString()} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 font-sans text-[11px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-territory-selected" />
                Main records ({categoryTotals[0].count.toLocaleString()})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-evidence" />
                Map shapes ({categoryTotals[1].count.toLocaleString()})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-uncertainty" />
                Links &amp; sources ({categoryTotals[2].count.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Table Switcher with Glyphs & Proportional Bars */}
      <section aria-label="Database tables by category" className="mt-7 space-y-5">
        {categories.map((cat) => {
          const catTables = Object.keys(tableNames).filter(
            (t) => tableDetails[t]?.category === cat,
          );
          return (
            <div key={cat}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {categoryLabels[cat].title}
                </h2>
                <span className="font-sans text-xs text-ash">
                  {categoryLabels[cat].subtitle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {catTables.map((tableId) => {
                  const isActive = tableId === selected;
                  const count = tableCounts[tableId] ?? 0;
                  const barPct = Math.max(4, Math.round((count / maxTableCount) * 100));
                  return (
                    <Link
                      key={tableId}
                      href={`/data?list=${tableId}`}
                      onClick={() => {
                        setInspectedIndex(0);
                        setViewMode(VISUAL_TABLES.has(tableId) ? "gallery" : "table");
                      }}
                      className={`group relative flex flex-col justify-between overflow-hidden border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-territory-selected bg-paper-raised text-ink shadow-xs"
                          : "border-border bg-paper text-ink-muted hover:border-ink hover:bg-paper-raised/60 hover:text-ink"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : "active-table-bar"}
                          className="absolute inset-x-0 top-0 h-0.5 bg-territory-selected"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-sans text-sm font-medium leading-snug text-ink">
                          {tableNames[tableId]}
                        </span>
                        <TableGlyph tableId={tableId} />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between gap-2 font-sans text-xs">
                        <code className="truncate text-[11px] text-ash">{tableId}</code>
                        <span className="tabular-nums font-semibold text-ink">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      {/* Subtle proportional bar */}
                      <div className="mt-1.5 h-0.5 w-full bg-border/40">
                        <div
                          className={`h-full ${isActive ? "bg-territory-selected" : "bg-ink/30"}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Active Table Banner & Controls */}
      <div className="mt-9 border-t border-ink pt-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                {tableNames[selected]}
              </h2>
              <code className="border border-border bg-paper-raised px-2 py-0.5 font-mono text-xs text-ink-muted">
                public.{selected}
              </code>
              <span className="font-sans text-sm tabular-nums text-ink-muted">
                {totalCount.toLocaleString()} {totalCount === 1 ? "record" : "records"}
                {query ? ` matching “${query}”` : ""}
              </span>
            </div>
            <p className="mt-2 max-w-2xl font-sans text-sm text-ink-muted">
              {detail.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
            <button
              type="button"
              onClick={() => setShowSchema((s) => !s)}
              aria-expanded={showSchema}
              className={`border px-3 py-2 transition-colors ${
                showSchema
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper-raised text-ink hover:border-ink"
              }`}
            >
              {showSchema ? "Hide column schema" : `Column schema (${columns.length})`}
            </button>
            <div className="inline-flex border border-border bg-paper-raised p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("gallery")}
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "gallery"
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Visual gallery
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Ledger table
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Column Schema Drawer */}
        <AnimatePresence initial={false}>
          {showSchema && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border border-border bg-paper-raised p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <h3 className="font-sans text-xs font-medium text-ink">
                  Table structure for <code>public.{selected}</code>
                </h3>
                <Link
                  href={`/connections?table=${selected}`}
                  className="font-sans text-xs text-territory-selected underline underline-offset-4"
                >
                  View in Schema Constellation
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex flex-col justify-between border border-border bg-paper px-3 py-2 font-sans text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-semibold text-ink">{col.name}</code>
                      <div className="flex items-center gap-1">
                        {col.isPrimary && (
                          <span className="border border-ink px-1.5 py-0.2 text-[10px] font-medium text-ink">
                            ID
                          </span>
                        )}
                        {!col.nullable && !col.isPrimary && (
                          <span className="text-[10px] text-ink-muted">required</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                      <span>{col.type}</span>
                      {col.references && (
                        <Link
                          href={`/data?list=${col.references.table}`}
                          className="text-territory-selected underline underline-offset-2"
                        >
                          ref: {col.references.table}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter Bar */}
        <form
          action="/data"
          onSubmit={(e) => {
            e.preventDefault();
            const qs = new URLSearchParams();
            qs.set("list", selected);
            if (searchInput.trim()) qs.set("q", searchInput.trim());
            router.push(`/data?${qs.toString()}`);
          }}
          className="mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-5 font-sans text-sm"
        >
          <input type="hidden" name="list" value={selected} />
          <div className="relative flex-1 min-w-64">
            <label htmlFor="data-search" className="sr-only">
              Search {tableNames[selected]}
            </label>
            <input
              id="data-search"
              name="q"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Filter ${tableNames[selected].toLowerCase()} by ID, name, year, region, or text…`}
              maxLength={100}
              className="w-full border border-border bg-paper-raised px-3.5 py-2 text-ink placeholder:text-ash focus:border-ink focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2 text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Filter records
          </button>
          {query && (
            <Link
              href={`/data?list=${selected}`}
              onClick={() => setSearchInput("")}
              className="border border-border px-3.5 py-2 text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              Clear filter
            </Link>
          )}
        </form>
      </div>

      {/* Main Split Workspace */}
      {rows.length === 0 ? (
        <div className="mt-10 border border-border bg-paper-raised p-10 text-center">
          <p className="font-display text-2xl text-ink">No matching records found</p>
          <p className="mt-2 font-sans text-sm text-ink-muted">
            No entries in <code>{selected}</code> matched “{query}”. Try clearing the filter or choosing another table above.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
          {/* Left Column: Visual Gallery or Ledger Table */}
          <div className="min-w-0">
            {viewMode === "gallery" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((row, index) => {
                  const isInspected = inspectedIndex === index;
                  const title =
                    row.name ||
                    row.title ||
                    row.label ||
                    row.name_text ||
                    row.english_words ||
                    row.id ||
                    `Row ${index + 1}`;
                  const subtitle =
                    row.role ||
                    row.region ||
                    row.place_kind ||
                    row.kingdom_type ||
                    row.source_type ||
                    row.licence ||
                    row.note ||
                    "";
                  const years =
                    row.start_year || row.from_year
                      ? `${row.start_year ?? row.from_year}${
                          row.end_year || row.to_year
                            ? `–${row.end_year ?? row.to_year}`
                            : ""
                        } CE`
                      : null;
                  const atlasUrl = recordAtlasLink(selected, row);
                  const accent = row.accent_color;

                  return (
                    <motion.article
                      key={index}
                      layout={!shouldReduceMotion}
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      transition={{ duration: 0.16 }}
                      onClick={() => setInspectedIndex(index)}
                      className={`group flex cursor-pointer flex-col overflow-hidden border transition-colors ${
                        isInspected
                          ? "border-territory-selected bg-paper-raised ring-1 ring-territory-selected"
                          : "border-border bg-paper-raised/60 hover:border-ink hover:bg-paper-raised"
                      }`}
                    >
                      {accent && (
                        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
                      )}

                      {row._image_url ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-stone">
                          <Image
                            src={row._image_url}
                            alt={row.alt_text || title}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            unoptimized
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          {years && (
                            <span className="absolute bottom-2 right-2 bg-ink/85 px-2 py-0.5 font-sans text-[11px] tabular-nums text-paper">
                              {years}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border-b border-border/60 bg-paper px-3.5 py-2 font-mono text-[11px] text-ash">
                          <span className="truncate">{row.id ?? `#${index + 1}`}</span>
                          {years && <span className="shrink-0 tabular-nums text-ink-muted">{years}</span>}
                        </div>
                      )}

                      <div className="flex flex-1 flex-col justify-between p-3.5">
                        <div>
                          {row._image_url && (
                            <code className="block truncate text-[10px] text-ash">
                              {row.id ?? `#${index + 1}`}
                            </code>
                          )}
                          <h3 className="mt-0.5 font-display text-xl leading-snug text-ink break-words">
                            {title}
                          </h3>
                          {subtitle && (
                            <p className="mt-1 line-clamp-2 font-sans text-xs text-ink-muted">
                              {subtitle}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 font-sans text-[11px]">
                          <span className="text-ink-muted">
                            {isInspected ? "Inspecting" : "Click to inspect"}
                          </span>
                          {atlasUrl && (
                            <Link
                              href={atlasUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-territory-selected underline underline-offset-4"
                            >
                              Open page
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div
                className="overflow-x-auto border border-border bg-paper-raised"
                tabIndex={0}
                role="region"
                aria-label={`${tableNames[selected]} records`}
              >
                <table className="w-full border-collapse text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-ink bg-paper">
                      {tableColumns.map((column) => (
                        <th
                          key={column.name}
                          scope="col"
                          className="px-3.5 py-3 font-medium text-ink"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span title={column.name}>{columnLabel(column.name)}</span>
                            <span className="font-mono text-[10px] font-normal text-ash">
                              {column.type}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const isInspected = inspectedIndex === index;
                      const atlasUrl = recordAtlasLink(selected, row);
                      return (
                        <tr
                          key={index}
                          onClick={() => setInspectedIndex(index)}
                          className={`cursor-pointer border-b border-border align-top transition-colors ${
                            isInspected
                              ? "bg-stone/50 text-ink"
                              : "hover:bg-paper text-ink-muted"
                          }`}
                        >
                          {tableColumns.map((column) => {
                            const rawValue = row[column.name];
                            const text = formatCellText(rawValue);
                            const isTitle =
                              column.name === "name" ||
                              column.name === "title" ||
                              column.name === "label";
                            const fk = column.references;

                            return (
                              <td
                                key={column.name}
                                className="max-w-72 px-3.5 py-3 break-words"
                              >
                                {isTitle ? (
                                  <div className="flex items-center gap-2.5">
                                    {row._image_url && (
                                      <Image
                                        src={row._image_url}
                                        alt=""
                                        width={36}
                                        height={36}
                                        unoptimized
                                        className="h-9 w-9 shrink-0 border border-border object-cover bg-stone"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-medium text-ink">{text}</span>
                                      {atlasUrl && (
                                        <Link
                                          href={atlasUrl}
                                          onClick={(e) => e.stopPropagation()}
                                          className="ml-2 inline-block text-xs text-territory-selected underline underline-offset-2"
                                        >
                                          Page
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                ) : column.name === "accent_color" && rawValue ? (
                                  <span className="inline-flex items-center gap-2 font-mono text-xs text-ink">
                                    <span
                                      className="h-3.5 w-3.5 border border-ink/30"
                                      style={{ backgroundColor: rawValue }}
                                    />
                                    {rawValue}
                                  </span>
                                ) : fk && rawValue ? (
                                  <Link
                                    href={`/data?list=${fk.table}&q=${encodeURIComponent(rawValue)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block border border-border bg-paper px-2 py-0.5 font-mono text-xs text-ink hover:border-territory-selected hover:text-territory-selected"
                                  >
                                    {rawValue}
                                  </Link>
                                ) : text.length > 110 ? (
                                  <span className="line-clamp-2 text-xs leading-relaxed">
                                    {text}
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      rawValue === null ? "italic text-ash text-xs" : ""
                                    }
                                  >
                                    {text}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <nav
              aria-label="Table pagination"
              className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-sans text-sm"
            >
              <span className="text-ink-muted tabular-nums">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} (Page{" "}
                {page} of {totalPages})
              </span>
              <div className="flex items-center gap-3">
                {page > 1 && (
                  <Link
                    href={`/data?list=${selected}&page=${page - 1}&q=${encodeURIComponent(query)}`}
                    className="border border-ink px-3.5 py-1.5 text-ink transition-colors hover:bg-ink hover:text-paper"
                  >
                    Previous page
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/data?list=${selected}&page=${page + 1}&q=${encodeURIComponent(query)}`}
                    className="border border-ink px-3.5 py-1.5 text-ink transition-colors hover:bg-ink hover:text-paper"
                  >
                    Next page
                  </Link>
                )}
              </div>
            </nav>
          </div>

          {/* Right Column: Sticky Live Specimen Inspector */}
          <aside
            aria-label="Selected record inspector"
            className="sticky top-20 border border-ink bg-paper-raised p-5"
          >
            {inspectedRow ? (
              <div>
                <div className="flex items-baseline justify-between gap-2 border-b border-border pb-3">
                  <div className="min-w-0">
                    <p className="font-sans text-[11px] uppercase tracking-wider text-ink-muted">
                      Record specimen
                    </p>
                    <h3 className="mt-0.5 font-display text-2xl text-ink break-words">
                      {inspectedRow.name ||
                        inspectedRow.title ||
                        inspectedRow.label ||
                        inspectedRow.id ||
                        "Selected row"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyJson(inspectedRow)}
                    className="shrink-0 border border-border bg-paper px-2.5 py-1 font-sans text-xs text-ink hover:border-ink"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Visual Plate or PostGIS Point Locator */}
                {inspectedRow._image_url ? (
                  <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden border border-border bg-stone">
                    <Image
                      src={inspectedRow._image_url}
                      alt={
                        inspectedRow.alt_text ||
                        inspectedRow.name ||
                        inspectedRow.title ||
                        "Record visual"
                      }
                      fill
                      sizes="400px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : inspectedCoords ? (
                  <CoordinateLocator
                    lon={inspectedCoords[0]}
                    lat={inspectedCoords[1]}
                    label={inspectedRow.name || inspectedRow.title || inspectedRow.id || "Point"}
                  />
                ) : null}

                {recordAtlasLink(selected, inspectedRow) && (
                  <div className="mt-4">
                    <Link
                      href={recordAtlasLink(selected, inspectedRow)!}
                      className="block w-full border border-ink bg-ink px-3.5 py-2 text-center font-sans text-xs text-paper transition-colors hover:bg-paper hover:text-ink"
                    >
                      Open in BHĀRATA Atlas
                    </Link>
                  </div>
                )}

                {inspectedRow.id && incomingLinks.length > 0 && (
                  <div className="mt-4 border-b border-border pb-4">
                    <p className="font-sans text-xs font-medium text-ink">
                      Related records referencing <code>{inspectedRow.id}</code>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {incomingLinks.map((link) => (
                        <Link
                          key={`${link.from_table}-${link.from_column}`}
                          href={`/data?list=${link.from_table}&q=${encodeURIComponent(inspectedRow.id!)}`}
                          className="border border-border bg-paper px-2 py-1 font-sans text-xs text-ink hover:border-territory-selected hover:text-territory-selected"
                        >
                          {tableNames[link.from_table]} ({link.from_column})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inspector Mode Switcher: Formatted Fields vs Raw JSON */}
                <div className="mt-4 flex border-b border-border font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => setInspectorTab("fields")}
                    className={`border-b-2 px-3 py-1.5 ${
                      inspectorTab === "fields"
                        ? "border-territory-selected font-medium text-ink"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    Details ({columns.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab("json")}
                    className={`border-b-2 px-3 py-1.5 ${
                      inspectorTab === "json"
                        ? "border-territory-selected font-medium text-ink"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    Raw data
                  </button>
                </div>

                {inspectorTab === "fields" ? (
                  <dl className="mt-3 max-h-[420px] space-y-2.5 overflow-y-auto pr-1 font-sans text-xs">
                    {columns.map((col) => {
                      const val = inspectedRow[col.name];
                      const fk = col.references;
                      return (
                        <div key={col.name} className="border-b border-border/60 pb-2">
                          <dt className="flex items-baseline justify-between gap-2 text-ink-muted">
                            <span className="font-medium text-ink">
                              {columnLabel(col.name)}
                            </span>
                            <code className="text-[10px] text-ash">
                              {col.name} ({col.type})
                            </code>
                          </dt>
                          <dd className="mt-1 break-words text-ink">
                            {val === null || val === undefined ? (
                              <span className="italic text-ash">NULL (Not recorded)</span>
                            ) : fk ? (
                              <Link
                                href={`/data?list=${fk.table}&q=${encodeURIComponent(val)}`}
                                className="inline-block border border-border bg-paper px-2 py-0.5 font-mono text-xs text-territory-selected underline underline-offset-2"
                              >
                                {val} → {tableNames[fk.table]}
                              </Link>
                            ) : col.type === "jsonb" ? (
                              <pre className="mt-1 overflow-x-auto bg-paper p-2 font-mono text-[11px] leading-relaxed text-ink">
                                {(() => {
                                  try {
                                    return JSON.stringify(JSON.parse(val), null, 2);
                                  } catch {
                                    return val;
                                  }
                                })()}
                              </pre>
                            ) : (
                              <span className="whitespace-pre-wrap leading-relaxed">
                                {formatCellText(val)}
                              </span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : (
                  <pre className="mt-3 max-h-[420px] overflow-auto border border-border bg-ink p-3 font-mono text-[11px] leading-relaxed text-paper">
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(inspectedRow).filter(([k]) => !k.startsWith("_")),
                      ),
                      null,
                      2,
                    )}
                  </pre>
                )}
              </div>
            ) : (
              <p className="font-sans text-sm text-ink-muted">
                Select any row to inspect its full attributes and relational links.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
