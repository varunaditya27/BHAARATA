import { Prisma } from '@/lib/generated/prisma/client';
import { database } from '@/lib/database';
import { tableNames } from '@/lib/database-info';

const identifier = (name: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error('Invalid database identifier');
  return Prisma.raw(`"${name}"`);
};

export async function browseTable(table: string, page: number, query: string) {
  if (!Object.hasOwn(tableNames, table)) throw new Error('Unknown table');
  const columns = await database.$queryRaw<{ name: string; type: string }[]>`
    SELECT column_name AS name, udt_name AS type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table} ORDER BY ordinal_position`;
  const keys = await database.$queryRaw<{ name: string }[]>`
    SELECT a.attname AS name FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, position) ON true
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
    WHERE n.nspname = 'public' AND t.relname = ${table} AND i.indisprimary ORDER BY k.position`;
  if (!columns.length || !keys.length) throw new Error('Table structure unavailable');

  const values = columns.map(column => {
    const field = Prisma.sql`t.${identifier(column.name)}`;
    const value = column.type === 'geometry'
      ? Prisma.sql`CASE WHEN ${field} IS NULL THEN NULL ELSE 'Map shape' END`
      : Prisma.sql`${field}::text`;
    return Prisma.sql`${column.name}::text, ${value}`;
  });
  const visibleRow = Prisma.sql`jsonb_build_object(${Prisma.join(values)})`;
  const order = Prisma.join(keys.map(key => Prisma.sql`t.${identifier(key.name)}`));
  const rows = await database.$queryRaw<{ row: Record<string, string | null> }[]>`
    SELECT ${visibleRow} AS row FROM ${identifier(table)} t
    WHERE position(lower(${query}) in lower((${visibleRow})::text)) > 0
    ORDER BY ${order} LIMIT 26 OFFSET ${(page - 1) * 25}`;
  return { columns, rows: rows.map(item => item.row) };
}
