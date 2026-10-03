import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { Shared } from "@/components/primitives/Shared";
import { InkName } from "@/components/entity/InkName";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { RisingTitle } from "@/components/entity/RisingTitle";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { images, type ImageKey } from "@/lib/data/images";
import { getPolityBySlug, getSourceById, milestones as events, people } from "@/lib/data/prototype";
import { personStatus } from "@/lib/data/status";
import { formatDatePoint, formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { NAV_BACK, NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/people/[slug]">) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  return { title: person ? `${person.name} — BHĀRATA` : "Person — BHĀRATA", description: person?.summary };
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart <= bEnd && bStart <= aEnd;

export default async function PersonPage({ params }: PageProps<"/people/[slug]">) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  const polity = person.polityId ? getPolityBySlug(person.polityId) : undefined;
  const accent = polity?.accentColor ?? "#5c5447";
  const status = personStatus(person);
  const lifetimeOnly = person.datesAre === "lifetime";
  const sourceRecords = person.provenance.filter((pv) => getSourceById(pv.sourceId));
  const reignStart = person.period.startYear;
  const reignEnd = person.period.endYear ?? reignStart;
  const portrait = person.imageKey ? images[person.imageKey as ImageKey] : undefined;

  // Events of this ruler's own kingdom that fall inside the reign.
  const reignEvents = events
    .filter((e) => (person.polityId ? e.polityIds.includes(person.polityId) : false))
    .filter((e) => overlaps(e.period.startYear, e.period.endYear ?? e.period.startYear, reignStart, reignEnd));

  // Rulers of *other* kingdoms whose reigns overlapped this one.
  const contemporaries = people
    .filter((p) => p.id !== person.id && p.polityId !== person.polityId)
    .filter((p) => overlaps(p.period.startYear, p.period.endYear ?? p.period.startYear, reignStart, reignEnd));

  const kingdomStart = polity?.period.startYear ?? reignStart;
  const kingdomEnd = polity?.period.endYear ?? reignEnd;
  const pct = (y: number) => ((y - kingdomStart) / Math.max(1, kingdomEnd - kingdomStart)) * 100;

  return (
    <PageTransition>
      <div
        className="bh-accented mx-auto max-w-[960px] px-4 py-14 sm:px-6"
        style={{ "--bh-accent": accent } as React.CSSProperties}
      >
        <div className="bh-reading-progress" aria-hidden />
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:items-end">
          <div>
            <Shared name={transitionNames.personPortrait(person.slug)}>
              <div className="relative">
                <RulerPortrait imageKey={person.imageKey} name={person.name} accentColor={accent} className="w-full" />
                <span className="pointer-events-none absolute inset-2 border border-paper/50" aria-hidden />
              </div>
            </Shared>
            {portrait ? (
              <p className="mt-2 font-sans text-xs text-ink-muted">
                {portrait.title} ·{" "}
                <a href={portrait.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {portrait.artist}, {portrait.license}
                </a>
              </p>
            ) : (
              <p className="mt-2 font-sans text-xs text-ink-muted">
                No old portrait or statue of this ruler is on file, so none is shown.
              </p>
            )}
          </div>

          <div>
            <Eyebrow>{person.role}</Eyebrow>
            <RisingTitle text={person.name} className="mt-2 text-5xl text-ink sm:text-6xl" />
            {person.nativeName && <InkName text={person.nativeName} lang={person.nativeLang} className="mt-2 text-2xl text-ink-muted" />}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-display text-xl text-ink">{formatPersonDates(person)}</p>
              <Badge tone={status.sourced ? "neutral" : "uncertainty"}>{status.label}</Badge>
            </div>
          </div>
        </div>

        <Rule className="mt-12" />

        <div className="mt-10 grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <div>
            {person.summary && <p className="bh-dropcap max-w-prose font-sans text-lg leading-relaxed text-ink">{person.summary}</p>}

            {polity && (
              <section className="mt-12">
                <Eyebrow>{lifetimeOnly ? "Their lifetime in the kingdom's history" : "The reign in the kingdom's history"}</Eyebrow>
                <div className="relative mt-5 h-3 bg-stone/60">
                  <div
                    className="bh-grow-x absolute h-full"
                    style={{ left: `${pct(reignStart)}%`, width: `${Math.max(1.5, pct(reignEnd) - pct(reignStart))}%`, backgroundColor: accent }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-sans text-xs text-ink-muted">
                  <span>
                    {polity.name} begins {formatDatePoint(polity.period.startQualifier, kingdomStart)}
                  </span>
                  <span>
                    ends {polity.period.endYear === null ? "—" : formatDatePoint(polity.period.endQualifier, kingdomEnd)}
                  </span>
                </div>
              </section>
            )}

            {reignEvents.length > 0 && (
              <section className="mt-12">
                <Eyebrow>{lifetimeOnly ? "During their lifetime" : "During the reign"}</Eyebrow>
                <ol className="bh-accent-rule mt-4 space-y-6 border-l pl-6">
                  {reignEvents.map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[29px] top-1.5 h-2 w-2 rotate-45" style={{ backgroundColor: accent }} aria-hidden />
                      <p className="font-sans text-sm text-ink-muted">{formatDateRange(e.period)}</p>
                      <h3 className="mt-0.5 font-display text-lg text-ink">{e.title}</h3>
                      <Link
                        href={`/atlas?year=${e.period.startYear}${polity ? `&polity=${polity.slug}` : ""}`}
                        transitionTypes={NAV_BACK}
                        className="mt-1 inline-block font-sans text-xs text-ink underline underline-offset-4"
                      >
                        See {e.period.startYear} on the atlas
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="space-y-10">
            {sourceRecords.length > 0 && (
              <section>
                <Eyebrow>Sources</Eyebrow>
                <ul className="mt-3 space-y-3">
                  {sourceRecords.map((pv) => (
                    <li key={pv.sourceId} className="border-t border-border pt-3 font-sans text-sm text-ink">
                      {getSourceById(pv.sourceId)?.title}
                      {pv.note && <span className="block text-xs text-ink-muted">{pv.note}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {polity && (
              <Link href={`/polities/${polity.slug}`} transitionTypes={NAV_FORWARD} className="bh-accent-rule group flex gap-4 border-t-2 pt-4">
                <KingdomEmblem polityId={polity.id} color={polity.accentColor} className="h-12 w-12" />
                <div>
                  <Eyebrow>Ruled</Eyebrow>
                  <p className="mt-1 font-display text-xl text-ink group-hover:[color:var(--bh-accent)]">{polity.name}</p>
                  <p className="font-sans text-xs text-ink-muted">{formatDateRange(polity.period)}</p>
                </div>
              </Link>
            )}

            <section>
              <Eyebrow>Ruling elsewhere at the same time</Eyebrow>
              {contemporaries.length === 0 ? (
                <p className="mt-3 font-sans text-sm text-ink-muted">No other ruler in the atlas reigned at the same time.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {contemporaries.map((p) => {
                    const theirs = p.polityId ? getPolityBySlug(p.polityId) : undefined;
                    return (
                      <li key={p.id} className="border-t border-border pt-3">
                        <Link href={`/people/${p.slug}`} transitionTypes={NAV_FORWARD} className="group block font-sans text-sm">
                          <span className="text-ink group-hover:underline">{p.name}</span>
                          <span className="block text-xs text-ink-muted">
                            {theirs?.name} · {formatDateRange(p.period)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
