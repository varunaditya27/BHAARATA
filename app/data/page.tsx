import { DataExplorer } from "@/components/database/DataExplorer";
import { browseTable } from "@/lib/database-browser";
import { getConnections, getTableCounts, tableNames } from "@/lib/database-info";

export const dynamic = "force-dynamic";
export const metadata = { title: "Browse the data — BHĀRATA" };

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{
    list?: string | string[];
    page?: string | string[];
    q?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const requested =
    first(params.list) === "items" ? "historical_items" : first(params.list);
  const selected =
    requested && Object.hasOwn(tableNames, requested) ? requested : "kingdoms";
  const query = (first(params.q) ?? "").trim().slice(0, 100);
  const page = Math.max(
    1,
    Math.min(10000, Number.parseInt(first(params.page) || "1", 10) || 1),
  );

  let data: Awaited<ReturnType<typeof browseTable>> | null = null;
  let tableCounts: Record<string, number> = {};
  let connections: Awaited<ReturnType<typeof getConnections>> = [];

  try {
    [data, tableCounts, connections] = await Promise.all([
      browseTable(selected, page, query),
      getTableCounts(),
      getConnections(),
    ]);
  } catch (error) {
    console.error("Could not load database table", error);
  }

  if (data === null) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl text-ink">Browse the data</h1>
        <p className="mt-8 text-ink-muted">
          The data is unavailable right now. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <DataExplorer
      selected={selected}
      query={query}
      page={page}
      columns={data.columns}
      rows={data.rows}
      totalCount={data.totalCount}
      pageSize={data.pageSize}
      tableCounts={tableCounts}
      connections={connections}
    />
  );
}
