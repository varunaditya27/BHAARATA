import Link from "next/link";
import { browseTable } from "@/lib/database-browser";
import { tableNames } from "@/lib/database-info";

export const dynamic = "force-dynamic";
export const metadata = { title: "Browse the data — BHĀRATA" };

function recordLink(table: string, row: Record<string, string | null>) {
  if (!row.page_name) return null;
  const paths: Record<string, string> = { kingdoms: "/polities/", people: "/people/", places: "/places/", events: "/chronology#", historical_items: "/evidence/" };
  return paths[table] ? `${paths[table]}${encodeURIComponent(row.page_name)}` : null;
}

function columnLabel(name: string) {
  if (name === "id") return "Record reference";
  return name.replace(/_id$/, " reference").replaceAll("_", " ");
}

export default async function DataPage({ searchParams }: { searchParams: Promise<{ list?: string | string[]; page?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const requested = first(params.list) === "items" ? "historical_items" : first(params.list);
  const selected = requested && Object.hasOwn(tableNames, requested) ? requested : "kingdoms";
  const query = (first(params.q) ?? "").trim().slice(0, 100);
  const page = Math.max(1, Math.min(10000, Number.parseInt(first(params.page) || "1", 10) || 1));
  let data: Awaited<ReturnType<typeof browseTable>> | null = null;
  try { data = await browseTable(selected, page, query); } catch (error) { console.error("Could not load database table", error); }
  const columns = data ? [...data.columns].sort((a, b) => Number(!["name", "title", "label"].includes(a.name)) - Number(!["name", "title", "label"].includes(b.name))) : [];

  return <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
    <h1 className="font-display text-5xl text-ink">Browse the data</h1>
    <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">Choose a list to see its entries and the details kept for each one.</p>
    <form action="/data" className="mt-8 flex flex-wrap items-end gap-4 border-b border-border pb-6 font-sans text-sm">
      <label className="flex min-w-48 flex-col gap-2" htmlFor="data-list">Choose a list
        <select id="data-list" name="list" defaultValue={selected} className="border border-border bg-paper px-3 py-2 text-ink">
          {Object.entries(tableNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-2" htmlFor="data-search">Search this list
        <input id="data-search" name="q" type="search" defaultValue={query} maxLength={100} className="border border-border bg-paper px-3 py-2 text-ink" />
      </label>
      <button type="submit" className="border border-ink px-4 py-2 text-ink">Show list</button>
    </form>
    {data === null ? <p className="mt-8 text-ink-muted">The data is unavailable right now. Please try again later.</p> : <>
      <h2 className="mt-8 font-display text-3xl text-ink">{tableNames[selected]}</h2>
      <p className="mt-2 text-sm text-ink-muted">Page {page}. <Link className="underline" href="/connections">See how the lists connect</Link>.</p>
      {data.rows.length === 0 && <p className="mt-6 text-ink-muted">No entries found.</p>}
      <p className="mt-6 text-sm text-ink-muted">Scroll sideways to see all columns.</p>
      <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={`${tableNames[selected]} table`}>
        <table className="w-full border-collapse text-left font-sans text-sm">
          <thead><tr className="border-b border-ink">{columns.map(column => <th key={column.name} scope="col" className="min-w-36 px-3 py-3 font-medium text-ink"><span title={column.name}>{columnLabel(column.name)}</span></th>)}</tr></thead>
          <tbody>{data.rows.slice(0, 25).map((row, index) => {
            const link = recordLink(selected, row);
            return <tr key={index} className="border-b border-border align-top">{columns.map(column => {
              const value = row[column.name];
              const text = value === null || value === undefined ? "Not recorded" : value === "" ? "Empty" : value === "true" ? "Yes" : value === "false" ? "No" : value;
              const isTitle = column.name === "name" || column.name === "title";
              return <td key={column.name} className="max-w-72 px-3 py-3 break-words text-ink-muted">{link && isTitle ? <Link href={link} className="text-ink underline underline-offset-4">{text}</Link> : text.length > 160 ? <details><summary className="cursor-pointer text-ink">Show details</summary><span className="whitespace-pre-wrap">{text}</span></details> : text}</td>;
            })}</tr>;
          })}</tbody>
        </table>
      </div>
      <nav aria-label="Pages" className="mt-8 flex gap-6">{page > 1 && <Link href={`/data?list=${selected}&page=${page - 1}&q=${encodeURIComponent(query)}`} className="underline">Previous</Link>}{data.rows.length > 25 && <Link href={`/data?list=${selected}&page=${page + 1}&q=${encodeURIComponent(query)}`} className="underline">Next</Link>}</nav>
    </>}
  </div>;
}
