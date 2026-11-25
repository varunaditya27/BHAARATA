import Link from "next/link";
import { SearchFilters } from "@/components/search/SearchFilters";
import { PageHero } from "@/components/primitives/PageHero";
import { PageTransition } from "@/components/primitives/PageTransition";
import { cn } from "@/lib/utils/cn";
import { KINDS, PAGE_SIZE, getFacets, parseFilters, runSearch, toQuery, type Facets, type Filters, type Kind } from "@/lib/search/advanced";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Search — BHĀRATA" };

const KIND_LABEL: Record<Kind, string> = { rulers: "Rulers", kingdoms: "Kingdoms", places: "Places", events: "Events" };

/** One removable chip per filter that is set. Each links to the same search without that filter. */
function chipsFor(f: Filters, facets: Facets): { label: string; href: string }[] {
  const kingdom = (id: string) => facets.kingdoms.find((k) => k.id === id)?.name ?? id;
  const chips: { label: string; patch: Partial<Filters> }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, patch: { q: "" } });
  f.kingdoms.forEach((id) => chips.push({ label: kingdom(id), patch: { kingdoms: f.kingdoms.filter((k) => k !== id) } }));
  if (f.from !== null) chips.push({ label: `from ${f.from}`, patch: { from: null } });
  if (f.to !== null) chips.push({ label: `to ${f.to}`, patch: { to: null } });
  if (f.region) chips.push({ label: f.region, patch: { region: "" } });
  if (f.religion) chips.push({ label: f.religion, patch: { religion: "" } });
  if (f.language) chips.push({ label: f.language, patch: { language: "" } });
  if (f.type) chips.push({ label: f.type, patch: { type: "" } });
  if (f.category) chips.push({ label: f.category === "battle" ? "Battles" : "Turning points", patch: { category: "" } });
  f.placeKinds.forEach((k) => chips.push({ label: k, patch: { placeKinds: f.placeKinds.filter((x) => x !== k) } }));
  if (f.protectedOnly) chips.push({ label: "Protected today", patch: { protectedOnly: false } });
  if (f.hasSummary) chips.push({ label: "Has a summary", patch: { hasSummary: false } });
  if (f.datesAre) chips.push({ label: f.datesAre === "reign" ? "Dates are a reign" : "Dates are a lifetime", patch: { datesAre: "" } });
  if (f.during) chips.push({ label: `Reigned during ${f.during === "battle" ? "a battle" : f.during === "major_event" ? "a turning point" : "an event"}`, patch: { during: "" } });
  if (f.contemporaryOf) chips.push({ label: `Same time as rulers of ${kingdom(f.contemporaryOf)}`, patch: { contemporaryOf: "" } });
  if (f.borders) chips.push({ label: `Bordered ${kingdom(f.borders)}`, patch: { borders: "" } });
  if (f.capitalOf) chips.push({ label: `Capital of ${kingdom(f.capitalOf)}`, patch: { capitalOf: "" } });
  if (f.insideKingdom) chips.push({ label: `Inside ${kingdom(f.insideKingdom)}${f.insideYear !== null ? ` in ${f.insideYear}` : ""}`, patch: { insideKingdom: "", insideYear: null } });
  if (f.minRulers) chips.push({ label: `${f.minRulers}+ rulers`, patch: { minRulers: null } });
  if (f.hasEvents) chips.push({ label: "Has an event", patch: { hasEvents: false } });
  if (f.reignOf) chips.push({ label: `Reign of “${f.reignOf}”`, patch: { reignOf: "" } });
  return chips.map((c) => ({ label: c.label, href: `/search${toQuery(f, { ...c.patch, page: 1 })}` }));
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const f = parseFilters(await searchParams);
  const [facets, page] = await Promise.all([getFacets(), runSearch(f)]);
  const chips = chipsFor(f, facets);
  const pages = Math.max(1, Math.ceil(page.total / PAGE_SIZE));

  return (
    <PageTransition>
            <PageHero
        title="Search"
        intro="Rulers, kingdoms, places and events, narrowed by time, place and the way they connect."
        field="#ffb000"
        ink="#120a38"
        tall={false}
      />
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <nav aria-label="What to search" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border">
          {KINDS.map((k) => (
            <Link
              key={k}
              href={`/search${toQuery(f, { kind: k, page: 1, ...(k === f.kind ? {} : RESET) })}`}
              aria-current={k === f.kind ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 pb-3 font-sans text-base transition-colors",
                k === f.kind ? "border-territory font-medium text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {KIND_LABEL[k]} <span className="tabular-nums text-sm text-ash">{facets.counts[k]}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[320px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-3">
            <SearchFilters f={f} facets={facets} />
          </aside>

          <section aria-live="polite">
            <p className="font-sans text-base text-ink">
              <span className="font-medium tabular-nums">{page.total}</span> {page.total === 1 ? "match" : "matches"}
            </p>

            {chips.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <li key={c.label}>
                    <Link
                      href={c.href}
                      aria-label={`Remove: ${c.label}`}
                      className="inline-flex items-center gap-1.5 border border-territory/50 bg-paper-raised px-2.5 py-1 font-sans text-sm text-ink transition-colors hover:border-territory-selected hover:text-territory-selected"
                    >
                      {c.label} <span aria-hidden>×</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {page.total === 0 ? (
              <p className="mt-10 font-sans text-lg text-ink-muted">Nothing matches. Remove a filter above, or clear them all.</p>
            ) : (
              <ol className="bh-stagger mt-6" key={`${f.kind}-${page.total}-${f.page}`}>
                {page.results.map((r, i) => (
                  <li
                    key={r.id}
                    className="bh-lift border-b border-border py-5"
                    style={{ ...(r.accent ? { borderLeft: `4px solid ${r.accent}`, paddingLeft: 16, "--bh-lift-color": r.accent } : { paddingLeft: 20 }), "--i": Math.min(i, 12) } as unknown as React.CSSProperties}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h2 className="font-display text-2xl text-ink">
                        <Link href={r.href} transitionTypes={NAV_FORWARD} className="hover:text-territory-selected">
                          {r.title}
                        </Link>
                      </h2>
                      <span className="font-sans text-sm tabular-nums text-ink-muted">{r.dates}</span>
                    </div>
                    {r.subtitle && <p className="mt-1 font-sans text-sm text-ink-muted">{r.subtitle}</p>}
                    {r.snippet && <p className="mt-2 max-w-prose font-sans text-base text-ink">{r.snippet}</p>}
                    {r.links.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                        {r.links.map((l) => (
                          <li key={l.href + l.label}>
                            <Link href={l.href} className="font-sans text-sm text-evidence underline underline-offset-4 hover:text-territory-selected">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {pages > 1 && (
              <nav aria-label="Pages" className="mt-8 flex items-center justify-between font-sans text-sm text-ink">
                {f.page > 1 ? (
                  <Link href={`/search${toQuery(f, { page: f.page - 1 })}`} className="underline underline-offset-4 hover:text-territory-selected">
                    Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="tabular-nums text-ink-muted">
                  {f.page} of {pages}
                </span>
                {f.page < pages ? (
                  <Link href={`/search${toQuery(f, { page: f.page + 1 })}`} className="underline underline-offset-4 hover:text-territory-selected">
                    Next
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

/** Filters that only make sense for one kind are dropped when switching tabs. Words, years and kingdoms carry over. */
const RESET: Partial<Filters> = {
  region: "", religion: "", language: "", type: "", category: "", placeKinds: [], protectedOnly: false, hasSummary: false,
  datesAre: "", during: "", contemporaryOf: "", borders: "", capitalOf: "", insideKingdom: "", insideYear: null,
  minRulers: null, hasEvents: false, reignOf: "",
};
