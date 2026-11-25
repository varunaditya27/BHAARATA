import Link from "next/link";
import { PageHero } from "@/components/primitives/PageHero";
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
    <>
      <PageHero
        title="How the data connects"
        intro="Every kingdom, ruler, place, battle and source is stored in 17 connected lists. Pick a list to see what it connects to, what it holds, or how two lists link together."
        field="#c01a3c"
        tall={false}
        size="lg"
      >
        <Link href="/data" className="mt-6 inline-block font-sans text-sm underline underline-offset-4">
          Browse all lists
        </Link>
      </PageHero>
    <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-8">

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
    </>
  );
}
