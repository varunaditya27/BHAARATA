import { database } from "@/lib/database";

export const tableNames: Record<string, string> = {
  kingdoms: "Kingdoms",
  people: "People",
  places: "Places",
  events: "Events",
  sources: "Sources",
  images: "Images",
  historical_items: "Historical items",
  item_text_lines: "Words from historical items",
  kingdom_borders: "Kingdom borders",
  routes: "Routes",
  kingdom_capitals: "Kingdom capitals",
  event_kingdoms: "Events and kingdoms",
  event_places: "Events and places",
  route_kingdoms: "Routes and kingdoms",
  item_kingdoms: "Items and kingdoms",
  other_names: "Other names",
  information_sources: "Sources for information",
};

export type TableCategory = "core" | "spatial" | "relations";

export const tableDetails: Record<
  string,
  { category: TableCategory; summary: string; primaryRoute?: string }
> = {
  kingdoms: {
    category: "core",
    summary: "55 kingdoms, empires, and sultanates across the subcontinent (600–1700 CE), with dates, language, religion, pigment colour, and hero photograph.",
    primaryRoute: "/polities/",
  },
  people: {
    category: "core",
    summary: "584 rulers and historical figures linked to their kingdom, reign or lifetime years, title, summary, and dedicated portrait or coin image.",
    primaryRoute: "/people/",
  },
  places: {
    category: "core",
    summary: "392 geolocated places—capitals, dated temples, forts, mosques, tombs, monasteries, and protected monuments—stored as PostGIS points.",
    primaryRoute: "/places/",
  },
  events: {
    category: "core",
    summary: "35 dated turning points and geolocated battles with coordinates, summaries, and confidence qualifiers.",
    primaryRoute: "/chronology#",
  },
  historical_items: {
    category: "core",
    summary: "Primary inscriptions and material evidence with physical medium, script, language, catalogue number, and historical claim.",
    primaryRoute: "/evidence/",
  },
  item_text_lines: {
    category: "core",
    summary: "Line-by-line English translations read from published epigraphical volumes for each historical item.",
  },
  sources: {
    category: "core",
    summary: "209 cited works, epigraphical volumes, datasets, and encyclopaedic references with full citation, URL, and licence.",
  },
  images: {
    category: "core",
    summary: "1,026 credited photographs, coins, manuscripts, and architectural views with creator, licence, source page, and descriptive alt text.",
  },
  kingdom_borders: {
    category: "spatial",
    summary: "466 dated PostGIS MultiPolygon territory shapes, uncertain frontier lines, and map label anchor points from Cliopatria.",
  },
  routes: {
    category: "spatial",
    summary: "PostGIS LineString maritime and overland corridors active during specific historical windows.",
  },
  kingdom_capitals: {
    category: "relations",
    summary: "Links each kingdom to its capital city or cities in the places table, preserving capital sequence and historical name as recorded.",
  },
  event_kingdoms: {
    category: "relations",
    summary: "Connects turning points and battles to participating or territory-holding kingdoms.",
  },
  event_places: {
    category: "relations",
    summary: "Links historical events to the specific places where they occurred.",
  },
  route_kingdoms: {
    category: "relations",
    summary: "Connects trade and maritime routes to the kingdoms that maintained or sailed them.",
  },
  item_kingdoms: {
    category: "relations",
    summary: "Links inscriptions and material artifacts to the kingdoms they attest.",
  },
  other_names: {
    category: "relations",
    summary: "Native-script names (Tamil, Devanagari, Kannada, Telugu) and alternate historical spellings for kingdoms, people, and places.",
  },
  information_sources: {
    category: "relations",
    summary: "1,798 provenance links connecting every kingdom, person, place, event, border, route, and inscription to its cited source.",
  },
};

export const categoryLabels: Record<TableCategory, { title: string; subtitle: string }> = {
  core: {
    title: "Core historical records",
    subtitle: "Primary entities, primary sources, and media assets",
  },
  spatial: {
    title: "PostGIS geography layers",
    subtitle: "Dated territory polygons, frontier lines, and trade corridors",
  },
  relations: {
    title: "Relational bridges & provenance",
    subtitle: "Foreign-key join tables, native-script names, and source citations",
  },
};

export type ConnectionLink = {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
};

export type TableColumnInfo = {
  table_name: string;
  column_name: string;
  type: string;
  nullable: boolean;
  is_primary: boolean;
};

export async function getConnections(): Promise<ConnectionLink[]> {
  const links = await database.$queryRaw<ConnectionLink[]>`
    SELECT DISTINCT
      source.relname AS from_table,
      sa.attname AS from_column,
      target.relname AS to_table,
      ta.attname AS to_column
    FROM pg_constraint c
    JOIN pg_class source ON source.oid = c.conrelid
    JOIN pg_class target ON target.oid = c.confrelid
    JOIN pg_namespace ns ON ns.oid = source.relnamespace
    JOIN LATERAL unnest(c.conkey, c.confkey) AS cols(src_attnum, tgt_attnum) ON true
    JOIN pg_attribute sa ON sa.attrelid = c.conrelid AND sa.attnum = cols.src_attnum
    JOIN pg_attribute ta ON ta.attrelid = c.confrelid AND ta.attnum = cols.tgt_attnum
    WHERE c.contype = 'f' AND ns.nspname = 'public'
    ORDER BY source.relname, target.relname, sa.attname`;
  return links.filter(({ from_table, to_table }) => tableNames[from_table] && tableNames[to_table]);
}

export async function getTableCounts(): Promise<Record<string, number>> {
  const rows = await database.$queryRaw<{ name: string; count: number }[]>`
    SELECT 'kingdoms' AS name, count(*)::int AS count FROM kingdoms
    UNION ALL SELECT 'people', count(*)::int FROM people
    UNION ALL SELECT 'places', count(*)::int FROM places
    UNION ALL SELECT 'events', count(*)::int FROM events
    UNION ALL SELECT 'historical_items', count(*)::int FROM historical_items
    UNION ALL SELECT 'item_text_lines', count(*)::int FROM item_text_lines
    UNION ALL SELECT 'sources', count(*)::int FROM sources
    UNION ALL SELECT 'images', count(*)::int FROM images
    UNION ALL SELECT 'kingdom_borders', count(*)::int FROM kingdom_borders
    UNION ALL SELECT 'routes', count(*)::int FROM routes
    UNION ALL SELECT 'kingdom_capitals', count(*)::int FROM kingdom_capitals
    UNION ALL SELECT 'event_kingdoms', count(*)::int FROM event_kingdoms
    UNION ALL SELECT 'event_places', count(*)::int FROM event_places
    UNION ALL SELECT 'route_kingdoms', count(*)::int FROM route_kingdoms
    UNION ALL SELECT 'item_kingdoms', count(*)::int FROM item_kingdoms
    UNION ALL SELECT 'other_names', count(*)::int FROM other_names
    UNION ALL SELECT 'information_sources', count(*)::int FROM information_sources
  `;
  return Object.fromEntries(rows.map((r) => [r.name, r.count]));
}

export async function getAllTableColumns(): Promise<Record<string, TableColumnInfo[]>> {
  const rows = await database.$queryRaw<TableColumnInfo[]>`
    WITH pk_cols AS (
      SELECT t.relname AS table_name, a.attname AS column_name
      FROM pg_index i
      JOIN pg_class t ON t.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN LATERAL unnest(i.indkey) AS k(attnum) ON true
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
      WHERE n.nspname = 'public' AND i.indisprimary
    )
    SELECT
      c.table_name,
      c.column_name,
      CASE
        WHEN c.udt_name = 'geometry' THEN 'geometry (PostGIS)'
        ELSE c.udt_name
      END AS type,
      (c.is_nullable = 'YES') AS nullable,
      EXISTS (
        SELECT 1 FROM pk_cols pk
        WHERE pk.table_name = c.table_name AND pk.column_name = c.column_name
      ) AS is_primary
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position
  `;
  const grouped: Record<string, TableColumnInfo[]> = {};
  for (const row of rows) {
    if (!tableNames[row.table_name]) continue;
    (grouped[row.table_name] ??= []).push(row);
  }
  return grouped;
}
