import Link from "next/link";
import { Connections } from "@/components/database/Connections";
import { getConnections, tableNames } from "@/lib/database-info";

export const dynamic = "force-dynamic";
export const metadata = { title: "How the data connects — BHĀRATA" };
export default async function ConnectionsPage() {
  let links: Awaited<ReturnType<typeof getConnections>> | null = null;
  try { links = await getConnections(); } catch { /* The database can be temporarily offline. */ }
  return <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
    <h1 className="font-display text-5xl text-ink">How the data connects</h1>
    <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">Each box is a list. Select one to see the other lists it connects to. For example, a kingdom can be linked to people, places and sources.</p>
    <p className="mt-3 text-sm text-ink-muted"><Link href="/data" className="underline">Browse the data</Link></p>
    {links ? <Connections names={tableNames} links={links} /> : <p className="mt-8 text-ink-muted">The data is unavailable right now. Please try again later.</p>}
  </div>;
}
