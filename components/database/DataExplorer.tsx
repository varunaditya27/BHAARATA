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
} from "@/lib/database-info";

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
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showSchema, setShowSchema] = useState(false);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(rows.length > 0 ? 0 : null);
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  const totalCorpusRecords = Object.values(tableCounts).reduce((sum, n) => sum + n, 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const detail = tableDetails[selected] ?? {
    category: "core" as TableCategory,
    summary: "",
  };

  // Prioritize primary display columns in table view
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

  const inspectedRow =
    inspectedIndex !== null && rows[inspectedIndex] ? rows[inspectedIndex] : null;

  // Incoming tables that reference the selected table
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
    <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-8">
      {/* Header & Live Corpus Ledger */}
      <div className="border-b border-ink pb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-sans text-sm text-ink-muted">
              PostgreSQL + PostGIS single source of truth
            </p>
            <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">
              Browse the archival database
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/connections"
              className="border border-ink bg-paper-raised px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Explore schema constellation ({connections.length} links)
            </Link>
          </div>
        </div>

        <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
          Every map boundary, ruler, place, battle, inscription, and source citation in BHĀRATA lives in 17 relational tables. Select any list below to filter records, inspect field types, or follow foreign-key links across the corpus.
        </p>

        {/* Live Corpus Metrics Strip */}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
          <div>
            <dt className="font-sans text-xs text-ink-muted">Total database records</dt>
            <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
              {totalCorpusRecords.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-ink-muted">Relational tables</dt>
            <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
              {Object.keys(tableNames).length}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-ink-muted">PostGIS geometries</dt>
            <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
              {(
                (tableCounts.kingdom_borders ?? 0) +
                (tableCounts.places ?? 0) +
                (tableCounts.events ?? 0) +
                (tableCounts.routes ?? 0)
              ).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-ink-muted">Credited visual media</dt>
            <dd className="mt-0.5 font-display text-2xl tabular-nums text-ink">
              {(tableCounts.images ?? 0).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Grouped Table Switcher */}
      <section aria-label="Database tables by category" className="mt-8 space-y-6">
        {categories.map((cat) => {
          const catTables = Object.keys(tableNames).filter(
            (t) => tableDetails[t]?.category === cat,
          );
          return (
            <div key={cat}>
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-sans text-sm font-medium text-ink">
                  {categoryLabels[cat].title}
                </h2>
                <span className="font-sans text-xs text-ink-muted">
                  {categoryLabels[cat].subtitle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {catTables.map((tableId) => {
                  const isActive = tableId === selected;
                  const count = tableCounts[tableId] ?? 0;
                  return (
                    <Link
                      key={tableId}
                      href={`/data?list=${tableId}`}
                      onClick={() => setInspectedIndex(0)}
                      className={`group relative flex flex-col justify-between border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-territory-selected bg-paper-raised text-ink"
                          : "border-border bg-paper text-ink-muted hover:border-ink hover:text-ink"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : "active-table-bar"}
                          className="absolute inset-x-0 top-0 h-0.5 bg-territory-selected"
                        />
                      )}
                      <span className="font-sans text-sm font-medium leading-snug text-ink">
                        {tableNames[tableId]}
                      </span>
                      <span className="mt-1.5 flex items-baseline justify-between gap-2 font-sans text-xs">
                        <code className="truncate text-[11px] text-ash">{tableId}</code>
                        <span className="tabular-nums font-medium text-ink-muted">
                          {count.toLocaleString()}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Active Table Banner & Controls */}
      <div className="mt-10 border-t border-ink pt-8">
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
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Ledger table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "cards"
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Specimen cards
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
                  View in relational diagram
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
                            PK
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

      {/* Main Split Workspace: Ledger / Cards on Left, Live Specimen Inspector on Right */}
      {rows.length === 0 ? (
        <div className="mt-10 border border-border bg-paper-raised p-10 text-center">
          <p className="font-display text-2xl text-ink">No matching records found</p>
          <p className="mt-2 font-sans text-sm text-ink-muted">
            No entries in <code>{selected}</code> matched “{query}”. Try clearing the filter or choosing another table above.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
          {/* Left Column: Table or Cards */}
          <div className="min-w-0">
            {viewMode === "table" ? (
              <div
                className="overflow-x-auto border border-border bg-paper-raised"
                tabIndex={0}
                role="region"
                aria-label={`${tableNames[selected]} records`}
              >
                <table className="w-full border-collapse text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-ink bg-paper">
                      {orderedColumns.map((column) => (
                        <th
                          key={column.name}
                          scope="col"
                          className="min-w-32 px-3.5 py-3 font-medium text-ink"
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
                          {orderedColumns.map((column) => {
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
                                        width={32}
                                        height={32}
                                        unoptimized
                                        className="h-8 w-8 shrink-0 border border-border object-cover bg-stone"
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
            ) : (
              /* Specimen Cards View */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  return (
                    <motion.article
                      key={index}
                      layout={!shouldReduceMotion}
                      onClick={() => setInspectedIndex(index)}
                      className={`cursor-pointer border p-4 transition-colors ${
                        isInspected
                          ? "border-territory-selected bg-paper-raised"
                          : "border-border bg-paper hover:border-ink"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {row._image_url && (
                          <Image
                            src={row._image_url}
                            alt=""
                            width={64}
                            height={64}
                            unoptimized
                            className="h-16 w-16 shrink-0 border border-border object-cover bg-stone"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <code className="truncate text-[11px] text-ash">
                              {row.id ?? `#${index + 1}`}
                            </code>
                            {years && (
                              <span className="shrink-0 font-sans text-xs tabular-nums text-ink-muted">
                                {years}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-display text-xl leading-snug text-ink break-words">
                            {title}
                          </h3>
                          {subtitle && (
                            <p className="mt-1 line-clamp-2 font-sans text-xs text-ink-muted">
                              {subtitle}
                            </p>
                          )}
                          {atlasUrl && (
                            <Link
                              href={atlasUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2 inline-block font-sans text-xs text-territory-selected underline underline-offset-4"
                            >
                              Open atlas page
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
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
            className="sticky top-6 border border-ink bg-paper-raised p-5"
          >
            {inspectedRow ? (
              <div>
                <div className="flex items-baseline justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <p className="font-sans text-xs text-ink-muted">
                      Record specimen inspector
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
                    {copied ? "Copied JSON" : "Copy JSON"}
                  </button>
                </div>

                {/* Visual Preview if row has an image */}
                {inspectedRow._image_url && (
                  <div className="mt-4 overflow-hidden border border-border bg-stone">
                    <Image
                      src={inspectedRow._image_url}
                      alt={
                        inspectedRow.alt_text ||
                        inspectedRow.name ||
                        inspectedRow.title ||
                        "Record visual"
                      }
                      width={360}
                      height={208}
                      unoptimized
                      className="max-h-52 w-full object-cover"
                    />
                  </div>
                )}

                {/* Link to Public Atlas Page */}
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

                {/* Incoming Relational Links ("Explore related rows") */}
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

                {/* Complete Field-by-Field Breakdown */}
                <dl className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1 font-sans text-xs">
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
              </div>
            ) : (
              <p className="font-sans text-sm text-ink-muted">
                Select any row in the ledger to inspect its full attributes and relational links.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
