import Link from "next/link";
import { Connections } from "@/components/database/Connections";
import {
  getAllTableColumns,
  getConnections,
  getTableCounts,
  tableNames,
} from "@/lib/database-info";

export const dynamic = "force-dynamic";
export const metadata = { title: "How the data connects — BHĀRATA" };

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialTable = Array.isArray(params.table) ? params.table[0] : params.table;

  let links: Awaited<ReturnType<typeof getConnections>> | null = null;
  let counts: Record<string, number> = {};
  let columnsByTable: Awaited<ReturnType<typeof getAllTableColumns>> = {};

  try {
    [links, counts, columnsByTable] = await Promise.all([
      getConnections(),
      getTableCounts(),
      getAllTableColumns(),
    ]);
  } catch {
    /* The database can be temporarily offline. */
  }

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-8">
      <div className="border-b border-ink pb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-sans text-sm text-ink-muted">
              PostgreSQL + PostGIS relational architecture
            </p>
            <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">
              How the database connects
            </h1>
          </div>
          <Link
            href="/data"
            className="border border-ink bg-paper-raised px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Open archival data ledger
          </Link>
        </div>
        <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
          Every historical record in BHĀRATA is linked by foreign-key constraints across 17 PostgreSQL tables. Select any table below to highlight its incoming and outgoing relationships, inspect its column schema, or trace the relational path between any two tables.
        </p>
      </div>

      {links ? (
        <Connections
          names={tableNames}
          links={links}
          counts={counts}
          columnsByTable={columnsByTable}
          initialTable={initialTable}
        />
      ) : (
        <p className="mt-8 text-ink-muted">
          The data is unavailable right now. Please try again later.
        </p>
      )}
    </div>
  );
}
