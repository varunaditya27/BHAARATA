import { database } from "@/lib/database";
import {
  tableNames,
  type ConnectionLink,
  type TableColumnInfo,
} from "@/lib/database-meta";

export {
  categoryLabels,
  tableDetails,
  tableNames,
  type ConnectionLink,
  type TableCategory,
  type TableColumnInfo,
} from "@/lib/database-meta";

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
