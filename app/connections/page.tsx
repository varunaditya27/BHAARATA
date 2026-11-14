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
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              How the data connects
            </h1>
          </div>
          <Link
            href="/data"
            className="border border-ink bg-paper-raised px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Browse all lists
          </Link>
        </div>
        <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
          Every kingdom, ruler, place, battle, and source is stored in 17 connected lists. Pick any list below to see what it connects to, what fields it holds, or how two lists link together.
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
