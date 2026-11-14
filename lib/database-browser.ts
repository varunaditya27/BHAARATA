import { Prisma } from "@/lib/generated/prisma/client";
import { database } from "@/lib/database";
import { getConnections, tableNames } from "@/lib/database-info";

const identifier = (name: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error("Invalid database identifier");
  return Prisma.raw(`"${name}"`);
};

export type BrowserColumn = {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  references?: { table: string; column: string };
};

export async function browseTable(table: string, page: number, query: string) {
  if (!Object.hasOwn(tableNames, table)) throw new Error("Unknown table");

  const [rawColumns, keys, allLinks] = await Promise.all([
    database.$queryRaw<{ name: string; type: string; nullable: boolean }[]>`
      SELECT column_name AS name, udt_name AS type, (is_nullable = 'YES') AS nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position`,
    database.$queryRaw<{ name: string }[]>`
      SELECT a.attname AS name FROM pg_index i
      JOIN pg_class t ON t.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, position) ON true
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
      WHERE n.nspname = 'public' AND t.relname = ${table} AND i.indisprimary
      ORDER BY k.position`,
    getConnections(),
  ]);

  if (!rawColumns.length || !keys.length) throw new Error("Table structure unavailable");

  const pkSet = new Set(keys.map((k) => k.name));
  const fkMap = new Map(
    allLinks
      .filter((l) => l.from_table === table)
      .map((l) => [l.from_column, { table: l.to_table, column: l.to_column }]),
  );

  const columns: BrowserColumn[] = rawColumns.map((col) => ({
    name: col.name,
    type: col.type === "geometry" ? "PostGIS geometry" : col.type,
    nullable: col.nullable,
    isPrimary: pkSet.has(col.name),
    references: fkMap.get(col.name),
  }));

  const values = rawColumns.map((column) => {
    const field = Prisma.sql`t.${identifier(column.name)}`;
    const value =
      column.type === "geometry"
        ? Prisma.sql`CASE
            WHEN ${field} IS NULL THEN NULL
            WHEN GeometryType(${field}) = 'POINT' THEN 'Point (' || round(ST_X(${field})::numeric, 4) || ', ' || round(ST_Y(${field})::numeric, 4) || ')'
            ELSE initcap(replace(GeometryType(${field}), 'MULTI', 'Multi-')) || ' (' || ST_NPoints(${field}) || ' vertices)'
          END`
        : Prisma.sql`${field}::text`;
    return Prisma.sql`${column.name}::text, ${value}`;
  });

  const visibleRow = Prisma.sql`jsonb_build_object(${Prisma.join(values)})`;
  const order = Prisma.join(keys.map((key) => Prisma.sql`t.${identifier(key.name)}`));
  const pageSize = 25;

  const [countRes, rowsRes] = await Promise.all([
    database.$queryRaw<{ count: number }[]>`
      SELECT count(*)::int AS count FROM ${identifier(table)} t
      WHERE position(lower(${query}) in lower((${visibleRow})::text)) > 0`,
    database.$queryRaw<{ row: Record<string, string | null> }[]>`
      SELECT ${visibleRow} AS row FROM ${identifier(table)} t
      WHERE position(lower(${query}) in lower((${visibleRow})::text)) > 0
      ORDER BY ${order}
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
  ]);

  const rows = rowsRes.map((item) => item.row);

  // Resolve image preview URLs for rows that reference an image ID or carry file_path_or_url
  const imgIds = new Set<string>();
  for (const row of rows) {
    for (const col of ["main_image_id", "portrait_id", "image_id"]) {
      const val = row[col];
      if (val) imgIds.add(val);
    }
  }

  let imgLookup: Record<string, string> = {};
  if (imgIds.size > 0) {
    const imgs = await database.images.findMany({
      where: { id: { in: [...imgIds] } },
      select: { id: true, file_path_or_url: true },
    });
    imgLookup = Object.fromEntries(imgs.map((i) => [i.id, i.file_path_or_url]));
  }

  const enrichedRows = rows.map((row) => {
    const directUrl = row.file_path_or_url;
    const refId = row.main_image_id || row.portrait_id || row.image_id;
    const resolvedImg = directUrl || (refId ? imgLookup[refId] : null) || null;
    return { ...row, _image_url: resolvedImg };
  });

  return {
    columns,
    rows: enrichedRows,
    totalCount: countRes[0]?.count ?? 0,
    pageSize,
  };
}
