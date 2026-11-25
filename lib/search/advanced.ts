import "server-only";
import { cache } from "react";
import { database } from "@/lib/database";
import { Prisma } from "@/lib/generated/prisma/client";
import { period } from "@/lib/data/read-atlas";
import { formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { fold } from "@/lib/utils/fold";

export const KINDS = ["rulers", "kingdoms", "places", "events"] as const;
export type Kind = (typeof KINDS)[number];

export const PAGE_SIZE = 30;

export type Filters = {
  kind: Kind;
  q: string;
  kingdoms: string[];
  from: number | null;
  to: number | null;
  region: string;
  religion: string;
  language: string;
  type: string;
  category: string;
  placeKinds: string[];
  protectedOnly: boolean;
  hasSummary: boolean;
  datesAre: "" | "reign" | "life";
  during: "" | "battle" | "major_event" | "any";
  contemporaryOf: string;
  borders: string;
  capitalOf: string;
  insideKingdom: string;
  insideYear: number | null;
  minRulers: number | null;
  hasEvents: boolean;
  reignOf: string;
  sort: "relevance" | "earliest" | "latest" | "name";
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim()).filter(Boolean);
const year = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return one(v) !== "" && Number.isInteger(n) && n >= -3000 && n <= 2100 ? n : null;
};
const flag = (v: string | string[] | undefined) => one(v) === "1";
const pick = <T extends string>(v: string | string[] | undefined, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(one(v)) ? (one(v) as T) : fallback;

/** Reads the address bar into a checked filter set. Anything unknown falls back to "no filter". */
export function parseFilters(raw: Raw): Filters {
  const min = Number(one(raw.minRulers));
  const page = Number(one(raw.page));
  return {
    kind: pick(raw.kind, KINDS, "rulers"),
    q: one(raw.q).slice(0, 120),
    kingdoms: many(raw.kingdom).slice(0, 20),
    from: year(raw.from),
    to: year(raw.to),
    region: one(raw.region),
    religion: one(raw.religion),
    language: one(raw.language),
    type: one(raw.type),
    category: one(raw.category),
    placeKinds: many(raw.placeKind).slice(0, 20),
    protectedOnly: flag(raw.protected),
    hasSummary: flag(raw.hasSummary),
    datesAre: pick(raw.datesAre, ["", "reign", "life"] as const, ""),
    during: pick(raw.during, ["", "battle", "major_event", "any"] as const, ""),
    contemporaryOf: one(raw.contemporaryOf),
    borders: one(raw.borders),
    capitalOf: one(raw.capitalOf),
    insideKingdom: one(raw.insideKingdom),
    insideYear: year(raw.insideYear),
    minRulers: Number.isInteger(min) && min > 0 ? Math.min(min, 500) : null,
    hasEvents: flag(raw.hasEvents),
    reignOf: one(raw.reignOf).slice(0, 80),
    sort: pick(raw.sort, ["relevance", "earliest", "latest", "name"] as const, "relevance"),
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 500) : 1,
  };
}


// ---------------------------------------------------------------------------
// Accent- and case-insensitive matching, so "rajaraja" finds "Rājarāja".
// ---------------------------------------------------------------------------

const ACCENTS: Record<string, string> = {
  ā: "a", ī: "i", ū: "u", ṛ: "r", ṝ: "r", ḷ: "l", ṅ: "n", ñ: "n", ṭ: "t", ḍ: "d", ṇ: "n", ś: "s", ṣ: "s",
  ḥ: "h", ṃ: "m", ṁ: "m", é: "e", è: "e", ê: "e", ē: "e", ō: "o", ö: "o", ü: "u", ç: "c", á: "a", à: "a",
  â: "a", í: "i", ó: "o", ú: "u", å: "a", ä: "a", ã: "a", ġ: "g", ḵ: "k", ẖ: "h", ṯ: "t", ẓ: "z", ḏ: "d",
};
const FROM = Object.keys(ACCENTS).filter((k) => k.length === 1).join("");
const TO = [...FROM].map((c) => ACCENTS[c]).join("");

/** SQL for the folded form of a column. */
const folded = (column: Prisma.Sql) => Prisma.sql`translate(lower(coalesce(${column}, '')), ${FROM}, ${TO})`;
const like = (column: Prisma.Sql, q: string) => Prisma.sql`${folded(column)} LIKE ${"%" + escapeLike(fold(q)) + "%"}`;
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);

const termMatch = (column: Prisma.Sql, value: string) => Prisma.sql`${column} ILIKE ${"%" + escapeLike(value) + "%"}`;

// ---------------------------------------------------------------------------
// One result shape for all four kinds.
// ---------------------------------------------------------------------------

export type Result = {
  id: string;
  kind: Kind;
  title: string;
  subtitle: string;
  dates: string;
  snippet?: string;
  href: string;
  accent?: string;
  links: { label: string; href: string }[];
};

export type Page = { results: Result[]; total: number };

const trim = (s: string | null, n = 220) => (!s ? undefined : s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s);

type DateColumns = {
  start_year: number | null;
  end_year: number | null;
  start_date_type: string;
  end_date_type: string;
  date_confidence: string;
};

const overlap = (start: Prisma.Sql, end: Prisma.Sql, from: number | null, to: number | null): Prisma.Sql[] => {
  const out: Prisma.Sql[] = [];
  if (to !== null) out.push(Prisma.sql`${start} IS NOT NULL AND ${start} <= ${to}`);
  if (from !== null) out.push(Prisma.sql`${start} IS NOT NULL AND coalesce(${end}, ${start}) >= ${from}`);
  return out;
};

const where = (conditions: Prisma.Sql[]) => (conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty);

const kingdomIn = (column: Prisma.Sql, ids: string[]) => Prisma.sql`${column} IN (${Prisma.join(ids)})`;

/** Orders by how well the name matches the words typed, then by the chosen sort. */
function orderBy(f: Filters, name: Prisma.Sql, start: Prisma.Sql): Prisma.Sql {
  const q = escapeLike(fold(f.q));
  const rank = f.q
    ? Prisma.sql`CASE WHEN ${folded(name)} = ${fold(f.q)} THEN 0 WHEN ${folded(name)} LIKE ${q + "%"} THEN 1 WHEN ${folded(name)} LIKE ${"%" + q + "%"} THEN 2 ELSE 3 END`
    : Prisma.sql`0::int`;
  switch (f.sort) {
    case "earliest": return Prisma.sql`ORDER BY ${start} ASC NULLS LAST, ${name}`;
    case "latest": return Prisma.sql`ORDER BY ${start} DESC NULLS LAST, ${name}`;
    case "name": return Prisma.sql`ORDER BY ${name}`;
    default: return Prisma.sql`ORDER BY ${rank}, ${start} ASC NULLS LAST, ${name}`;
  }
}

const offset = (f: Filters) => (f.page - 1) * PAGE_SIZE;

// ---------------------------------------------------------------------------
// Rulers: people joined to their kingdom, to events, to other rulers.
// ---------------------------------------------------------------------------

type RulerRow = DateColumns & {
  id: string; page_name: string; name: string; role: string; summary: string | null; date_kind: string | null;
  kingdom_id: string | null; kingdom_name: string | null; kingdom_slug: string | null; accent_color: string | null; total: bigint;
};

async function searchRulers(f: Filters): Promise<Page> {
  const c: Prisma.Sql[] = [];
  if (f.q) {
    c.push(Prisma.sql`(${like(Prisma.sql`p.name`, f.q)} OR ${like(Prisma.sql`p.role`, f.q)} OR ${like(Prisma.sql`p.summary`, f.q)}
      OR EXISTS (SELECT 1 FROM other_names o WHERE o.person_id = p.id AND ${like(Prisma.sql`o.name_text`, f.q)}))`);
  }
  if (f.kingdoms.length) c.push(kingdomIn(Prisma.sql`p.kingdom_id`, f.kingdoms));
  if (f.region) c.push(Prisma.sql`k.region = ${f.region}`);
  if (f.religion) c.push(termMatch(Prisma.sql`k.religion`, f.religion));
  if (f.language) c.push(termMatch(Prisma.sql`k.language`, f.language));
  if (f.type) c.push(Prisma.sql`k.kingdom_type = ${f.type}`);
  c.push(...overlap(Prisma.sql`p.start_year`, Prisma.sql`p.end_year`, f.from, f.to));
  if (f.hasSummary) c.push(Prisma.sql`p.summary IS NOT NULL`);
  if (f.datesAre) c.push(Prisma.sql`p.date_kind = ${f.datesAre === "reign" ? "time_as_ruler" : "life"}::person_date_type`);
  if (f.during) {
    const category = f.during === "any" ? Prisma.empty : Prisma.sql`AND e.category = ${f.during}`;
    c.push(Prisma.sql`EXISTS (SELECT 1 FROM event_kingdoms ek JOIN events e ON e.id = ek.event_id
      WHERE ek.kingdom_id = p.kingdom_id ${category}
        AND p.start_year IS NOT NULL AND e.start_year BETWEEN p.start_year AND coalesce(p.end_year, p.start_year))`);
  }
  if (f.contemporaryOf) {
    c.push(Prisma.sql`p.start_year IS NOT NULL AND p.kingdom_id IS DISTINCT FROM ${f.contemporaryOf} AND EXISTS (
      SELECT 1 FROM people p2 WHERE p2.kingdom_id = ${f.contemporaryOf} AND p2.start_year IS NOT NULL
        AND p2.start_year <= coalesce(p.end_year, p.start_year) AND coalesce(p2.end_year, p2.start_year) >= p.start_year)`);
  }

  const rows = await database.$queryRaw<RulerRow[]>`
    SELECT p.id, p.page_name, p.name, p.role, p.summary, p.date_kind::text AS date_kind,
           p.start_year, p.end_year, p.start_date_type::text AS start_date_type, p.end_date_type::text AS end_date_type,
           p.date_confidence::text AS date_confidence,
           k.id AS kingdom_id, k.name AS kingdom_name, k.page_name AS kingdom_slug, k.accent_color,
           count(*) OVER() AS total
    FROM people p LEFT JOIN kingdoms k ON k.id = p.kingdom_id
    ${where(c)}
    ${orderBy(f, Prisma.sql`p.name`, Prisma.sql`p.start_year`)}
    LIMIT ${PAGE_SIZE} OFFSET ${offset(f)}`;

  return {
    total: Number(rows[0]?.total ?? 0),
    results: rows.map((r) => ({
      id: r.id,
      kind: "rulers" as const,
      title: r.name,
      subtitle: r.role,
      dates: formatPersonDates({ period: period(r), datesAre: r.date_kind === "life" ? "lifetime" : r.date_kind ? "reign" : undefined }),
      snippet: trim(r.summary),
      href: `/people/${r.page_name}`,
      accent: r.accent_color ?? undefined,
      links: r.kingdom_slug ? [{ label: r.kingdom_name ?? r.kingdom_slug, href: `/polities/${r.kingdom_slug}` }] : [],
    })),
  };
}

// ---------------------------------------------------------------------------
// Kingdoms: joined to rulers, events, capitals, and (with PostGIS) to each other's borders.
// ---------------------------------------------------------------------------

type KingdomRow = DateColumns & {
  id: string; page_name: string; name: string; kingdom_type: string; region: string; notable_for: string | null; summary: string;
  accent_color: string; rulers: bigint; events: bigint; capitals: string | null; total: bigint;
};

async function searchKingdoms(f: Filters): Promise<Page> {
  const c: Prisma.Sql[] = [];
  if (f.q) {
    c.push(Prisma.sql`(${like(Prisma.sql`k.name`, f.q)} OR ${like(Prisma.sql`k.summary`, f.q)} OR ${like(Prisma.sql`k.notable_for`, f.q)}
      OR ${like(Prisma.sql`k.region`, f.q)}
      OR EXISTS (SELECT 1 FROM other_names o WHERE o.kingdom_id = k.id AND ${like(Prisma.sql`o.name_text`, f.q)}))`);
  }
  if (f.kingdoms.length) c.push(kingdomIn(Prisma.sql`k.id`, f.kingdoms));
  if (f.region) c.push(Prisma.sql`k.region = ${f.region}`);
  if (f.religion) c.push(termMatch(Prisma.sql`k.religion`, f.religion));
  if (f.language) c.push(termMatch(Prisma.sql`k.language`, f.language));
  if (f.type) c.push(Prisma.sql`k.kingdom_type = ${f.type}`);
  c.push(...overlap(Prisma.sql`k.start_year`, Prisma.sql`k.end_year`, f.from, f.to));
  if (f.minRulers) c.push(Prisma.sql`(SELECT count(*) FROM people p WHERE p.kingdom_id = k.id) >= ${f.minRulers}`);
  if (f.hasEvents) c.push(Prisma.sql`EXISTS (SELECT 1 FROM event_kingdoms ek WHERE ek.kingdom_id = k.id)`);
  if (f.borders) {
    c.push(Prisma.sql`k.id <> ${f.borders} AND EXISTS (
      SELECT 1 FROM kingdom_borders a JOIN kingdom_borders b
        ON ST_Intersects(a.outline, b.outline) AND a.from_year <= b.to_year AND b.from_year <= a.to_year
      WHERE a.kingdom_id = k.id AND b.kingdom_id = ${f.borders})`);
  }

  const rows = await database.$queryRaw<KingdomRow[]>`
    SELECT k.id, k.page_name, k.name, k.kingdom_type, k.region, k.notable_for, k.summary, k.accent_color,
           k.start_year, k.end_year, k.start_date_type::text AS start_date_type, k.end_date_type::text AS end_date_type,
           k.date_confidence::text AS date_confidence,
           (SELECT count(*) FROM people p WHERE p.kingdom_id = k.id) AS rulers,
           (SELECT count(DISTINCT ek.event_id) FROM event_kingdoms ek WHERE ek.kingdom_id = k.id) AS events,
           (SELECT string_agg(coalesce(kc.name_as_recorded, pl.name), ', ' ORDER BY kc.display_order)
              FROM kingdom_capitals kc JOIN places pl ON pl.id = kc.place_id WHERE kc.kingdom_id = k.id) AS capitals,
           count(*) OVER() AS total
    FROM kingdoms k
    ${where(c)}
    ${orderBy(f, Prisma.sql`k.name`, Prisma.sql`k.start_year`)}
    LIMIT ${PAGE_SIZE} OFFSET ${offset(f)}`;

  return {
    total: Number(rows[0]?.total ?? 0),
    results: rows.map((r) => {
      const rulers = Number(r.rulers);
      const events = Number(r.events);
      return {
        id: r.id,
        kind: "kingdoms" as const,
        title: r.name,
        subtitle: [r.kingdom_type, r.region, r.capitals ? `capital: ${r.capitals}` : null].filter(Boolean).join(" · "),
        dates: formatDateRange(period(r)),
        snippet: trim(r.notable_for ?? r.summary),
        href: `/polities/${r.page_name}`,
        accent: r.accent_color,
        links: [
          { label: `${rulers} ${rulers === 1 ? "ruler" : "rulers"}`, href: `/search?kind=rulers&kingdom=${r.id}` },
          ...(events ? [{ label: `${events} ${events === 1 ? "event" : "events"}`, href: `/search?kind=events&kingdom=${r.id}` }] : []),
          { label: "On the map", href: `/atlas?polity=${r.page_name}` },
        ],
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Places: joined to capitals, and spatially to the borders of kingdoms.
// ---------------------------------------------------------------------------

type PlaceRow = {
  id: string; page_name: string; name: string; place_kind: string; region: string | null; protected_place: boolean;
  start_year: number | null; capital_of: string | null; total: bigint;
};

async function searchPlaces(f: Filters): Promise<Page> {
  const c: Prisma.Sql[] = [Prisma.sql`p.page_name IS NOT NULL`];
  if (f.q) {
    c.push(Prisma.sql`(${like(Prisma.sql`p.name`, f.q)} OR ${like(Prisma.sql`p.region`, f.q)}
      OR EXISTS (SELECT 1 FROM other_names o WHERE o.place_id = p.id AND ${like(Prisma.sql`o.name_text`, f.q)}))`);
  }
  if (f.placeKinds.length) c.push(Prisma.sql`p.place_kind IN (${Prisma.join(f.placeKinds)})`);
  if (f.region) c.push(Prisma.sql`p.region = ${f.region}`);
  if (f.protectedOnly) c.push(Prisma.sql`p.protected_place`);
  if (f.capitalOf) c.push(Prisma.sql`EXISTS (SELECT 1 FROM kingdom_capitals kc WHERE kc.place_id = p.id AND kc.kingdom_id = ${f.capitalOf})`);
  if (f.insideKingdom) {
    const when = f.insideYear === null ? Prisma.empty : Prisma.sql`AND ${f.insideYear} BETWEEN b.from_year AND b.to_year`;
    c.push(Prisma.sql`EXISTS (SELECT 1 FROM kingdom_borders b WHERE b.kingdom_id = ${f.insideKingdom} AND ST_Intersects(b.outline, p.map_point) ${when})`);
  }

  const rows = await database.$queryRaw<PlaceRow[]>`
    SELECT p.id, p.page_name, p.name, p.place_kind, p.region, p.protected_place, p.start_year,
           (SELECT string_agg(k.name, ', ' ORDER BY k.name) FROM kingdom_capitals kc JOIN kingdoms k ON k.id = kc.kingdom_id WHERE kc.place_id = p.id) AS capital_of,
           count(*) OVER() AS total
    FROM places p
    ${where(c)}
    ${orderBy(f, Prisma.sql`p.name`, Prisma.sql`p.start_year`)}
    LIMIT ${PAGE_SIZE} OFFSET ${offset(f)}`;

  return {
    total: Number(rows[0]?.total ?? 0),
    results: rows.map((r) => ({
      id: r.id,
      kind: "places" as const,
      title: r.name,
      subtitle: [r.place_kind, r.region && r.region !== "Indian subcontinent" ? r.region : null, r.capital_of ? `capital of ${r.capital_of}` : null]
        .filter(Boolean).join(" · "),
      dates: r.protected_place ? "Protected today" : r.start_year !== null ? `Dated c. ${r.start_year} CE` : "",
      href: `/places/${r.page_name}`,
      links: [],
    })),
  };
}

// ---------------------------------------------------------------------------
// Events: joined to kingdoms, to places, and to the reigns of rulers.
// ---------------------------------------------------------------------------

type EventRow = DateColumns & {
  id: string; title: string; category: string | null; summary: string; kingdoms: string | null; kingdom_slugs: string | null; total: bigint;
};

async function searchEvents(f: Filters): Promise<Page> {
  const c: Prisma.Sql[] = [];
  if (f.q) c.push(Prisma.sql`(${like(Prisma.sql`e.title`, f.q)} OR ${like(Prisma.sql`e.summary`, f.q)})`);
  if (f.category) c.push(Prisma.sql`e.category = ${f.category}`);
  if (f.kingdoms.length) {
    c.push(Prisma.sql`EXISTS (SELECT 1 FROM event_kingdoms ek WHERE ek.event_id = e.id AND ${kingdomIn(Prisma.sql`ek.kingdom_id`, f.kingdoms)})`);
  }
  c.push(...overlap(Prisma.sql`e.start_year`, Prisma.sql`e.end_year`, f.from, f.to));
  if (f.insideKingdom) {
    c.push(Prisma.sql`e.map_point IS NOT NULL AND EXISTS (SELECT 1 FROM kingdom_borders b WHERE b.kingdom_id = ${f.insideKingdom}
      AND ST_Intersects(b.outline, e.map_point) AND e.start_year BETWEEN b.from_year AND b.to_year)`);
  }
  if (f.reignOf) {
    c.push(Prisma.sql`e.start_year IS NOT NULL AND EXISTS (
      SELECT 1 FROM people pp JOIN event_kingdoms ek ON ek.kingdom_id = pp.kingdom_id
      WHERE ek.event_id = e.id AND ${like(Prisma.sql`pp.name`, f.reignOf)} AND pp.start_year IS NOT NULL
        AND e.start_year BETWEEN pp.start_year AND coalesce(pp.end_year, pp.start_year))`);
  }

  const rows = await database.$queryRaw<EventRow[]>`
    SELECT e.id, e.title, e.category, e.summary,
           e.start_year, e.end_year, e.start_date_type::text AS start_date_type, e.end_date_type::text AS end_date_type,
           e.date_confidence::text AS date_confidence,
           (SELECT string_agg(DISTINCT k.name, '|') FROM event_kingdoms ek JOIN kingdoms k ON k.id = ek.kingdom_id WHERE ek.event_id = e.id) AS kingdoms,
           (SELECT string_agg(DISTINCT k.page_name, '|') FROM event_kingdoms ek JOIN kingdoms k ON k.id = ek.kingdom_id WHERE ek.event_id = e.id) AS kingdom_slugs,
           count(*) OVER() AS total
    FROM events e
    ${where(c)}
    ${orderBy(f, Prisma.sql`e.title`, Prisma.sql`e.start_year`)}
    LIMIT ${PAGE_SIZE} OFFSET ${offset(f)}`;

  return {
    total: Number(rows[0]?.total ?? 0),
    results: rows.map((r) => {
      const names = r.kingdoms?.split("|") ?? [];
      const slugs = r.kingdom_slugs?.split("|") ?? [];
      return {
        id: r.id,
        kind: "events" as const,
        title: r.title,
        subtitle: r.category === "battle" ? "Battle" : r.category === "major_event" ? "Turning point" : "Event",
        dates: formatDateRange(period(r)),
        snippet: trim(r.summary),
        href: `/atlas?year=${r.start_year ?? ""}${slugs[0] ? `&polity=${slugs[0]}` : ""}`,
        links: names.slice(0, 4).map((label, i) => ({ label, href: `/polities/${slugs[i]}` })),
      };
    }),
  };
}

export async function runSearch(f: Filters): Promise<Page> {
  switch (f.kind) {
    case "kingdoms": return searchKingdoms(f);
    case "places": return searchPlaces(f);
    case "events": return searchEvents(f);
    default: return searchRulers(f);
  }
}

// ---------------------------------------------------------------------------
// Choices for the filter menus, read from the data itself.
// ---------------------------------------------------------------------------

export type Facets = {
  kingdoms: { id: string; name: string }[];
  regions: string[];
  religions: string[];
  languages: string[];
  types: string[];
  eventCategories: string[];
  placeKinds: { kind: string; n: number }[];
  placeRegions: string[];
  counts: { rulers: number; kingdoms: number; places: number; events: number };
};

const terms = (rows: { v: string | null }[]) => [...new Set(rows.flatMap((r) => (r.v ?? "").split(/,\s*/)).map((s) => s.trim()).filter(Boolean))].sort();

export const getFacets = cache(async (): Promise<Facets> => {
  const [kingdoms, regions, religions, languages, types, eventCategories, placeKinds, placeRegions, counts] = await Promise.all([
    database.$queryRaw<{ id: string; name: string }[]>`SELECT id, name FROM kingdoms ORDER BY name`,
    database.$queryRaw<{ v: string }[]>`SELECT DISTINCT region AS v FROM kingdoms WHERE region <> '' ORDER BY 1`,
    database.$queryRaw<{ v: string | null }[]>`SELECT DISTINCT religion AS v FROM kingdoms WHERE religion IS NOT NULL`,
    database.$queryRaw<{ v: string | null }[]>`SELECT DISTINCT language AS v FROM kingdoms WHERE language IS NOT NULL`,
    database.$queryRaw<{ v: string }[]>`SELECT DISTINCT kingdom_type AS v FROM kingdoms ORDER BY 1`,
    database.$queryRaw<{ v: string }[]>`SELECT DISTINCT category AS v FROM events WHERE category IS NOT NULL ORDER BY 1`,
    database.$queryRaw<{ kind: string; n: bigint }[]>`SELECT place_kind AS kind, count(*) AS n FROM places WHERE page_name IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
    database.$queryRaw<{ v: string }[]>`SELECT region AS v FROM places WHERE page_name IS NOT NULL AND region IS NOT NULL GROUP BY 1 ORDER BY count(*) DESC LIMIT 12`,
    database.$queryRaw<{ rulers: bigint; kingdoms: bigint; places: bigint; events: bigint }[]>`
      SELECT (SELECT count(*) FROM people) AS rulers, (SELECT count(*) FROM kingdoms) AS kingdoms,
             (SELECT count(*) FROM places WHERE page_name IS NOT NULL) AS places, (SELECT count(*) FROM events) AS events`,
  ]);
  return {
    kingdoms,
    regions: regions.map((r) => r.v),
    religions: terms(religions),
    languages: terms(languages),
    types: types.map((r) => r.v),
    eventCategories: eventCategories.map((r) => r.v),
    placeKinds: placeKinds.map((r) => ({ kind: r.kind, n: Number(r.n) })),
    placeRegions: placeRegions.map((r) => r.v),
    counts: Object.fromEntries(Object.entries(counts[0]).map(([k, v]) => [k, Number(v)])) as Facets["counts"],
  };
});

// ---------------------------------------------------------------------------
// The address-bar form of a filter set, so every search can be shared and every chip can remove itself.
// ---------------------------------------------------------------------------

const DEFAULTS = parseFilters({});

/** Builds `?kind=…&q=…` from filters, leaving out anything at its default. `patch` overrides single fields. */
export function toQuery(f: Filters, patch: Partial<Filters> = {}): string {
  const g = { ...f, ...patch };
  const params = new URLSearchParams();
  const put = (key: string, value: string | number | null | boolean, base: string | number | null | boolean) => {
    if (value !== base && value !== "" && value !== null) params.set(key, value === true ? "1" : String(value));
  };
  put("kind", g.kind, DEFAULTS.kind);
  put("q", g.q, "");
  g.kingdoms.forEach((k) => params.append("kingdom", k));
  put("from", g.from, null);
  put("to", g.to, null);
  put("region", g.region, "");
  put("religion", g.religion, "");
  put("language", g.language, "");
  put("type", g.type, "");
  put("category", g.category, "");
  g.placeKinds.forEach((k) => params.append("placeKind", k));
  put("protected", g.protectedOnly, false);
  put("hasSummary", g.hasSummary, false);
  put("datesAre", g.datesAre, "");
  put("during", g.during, "");
  put("contemporaryOf", g.contemporaryOf, "");
  put("borders", g.borders, "");
  put("capitalOf", g.capitalOf, "");
  put("insideKingdom", g.insideKingdom, "");
  put("insideYear", g.insideYear, null);
  put("minRulers", g.minRulers, null);
  put("hasEvents", g.hasEvents, false);
  put("reignOf", g.reignOf, "");
  put("sort", g.sort, DEFAULTS.sort);
  put("page", g.page, 1);
  const s = params.toString();
  return s ? `?${s}` : "";
}
