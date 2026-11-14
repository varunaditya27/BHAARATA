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
import type { ImageKey } from "@/lib/domain/types";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { personStatus } from "@/lib/data/status";
import { formatDatePoint, formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { NAV_BACK, NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";



export async function generateMetadata({ params }: PageProps<"/people/[slug]">) {
  const { people } = await getAtlasData();
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  return { title: person ? `${person.name} — BHĀRATA` : "Person — BHĀRATA", description: person?.summary };
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart <= bEnd && bStart <= aEnd;

export default async function PersonPage({ params }: PageProps<"/people/[slug]">) {
  const data = await getAtlasData();
  const { people, images } = data;
  const { getPolityById, getSourceById, milestones: events } = atlasAccess(data);
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  const polity = person.polityId ? getPolityById(person.polityId) : undefined;
  const accent = polity?.accentColor ?? "#5c5447";
  const status = personStatus(person);
  const lifetimeOnly = person.datesAre === "lifetime";
  const sourceRecords = person.provenance.filter((pv) => getSourceById(pv.sourceId));
  const personDateKnown = person.period.startQualifier !== "unknown";
  const kingdomDatesKnown = polity && polity.period.startQualifier !== "unknown" && polity.period.endQualifier !== "unknown" && polity.period.endYear !== null;
  const reignStart = person.period.startYear;
  const reignEnd = person.period.endYear ?? reignStart;
  const portrait = person.imageKey ? images[person.imageKey as ImageKey] : undefined;

  // Events of this ruler's own kingdom that fall inside the reign.
  const reignEvents = events
    .filter((e) => (person.polityId ? e.polityIds.includes(person.polityId) : false))
    .filter((e) => personDateKnown && e.period.startQualifier !== "unknown" && overlaps(e.period.startYear, e.period.endYear ?? e.period.startYear, reignStart, reignEnd));

  // Rulers of *other* kingdoms whose reigns overlapped this one.
  const contemporaries = people
    .filter((p) => p.id !== person.id && p.polityId !== person.polityId)
    .filter((p) => personDateKnown && p.period.startQualifier !== "unknown" && overlaps(p.period.startYear, p.period.endYear ?? p.period.startYear, reignStart, reignEnd));

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
        <div className="grid items-end gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
          {portrait ? (
            <div className="w-40 sm:w-56">
              <Shared name={transitionNames.personPortrait(person.slug)}>
                <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-full" />
              </Shared>
              <p className="mt-2 font-sans text-xs text-ink-muted">
                {portrait.title}.{" "}
                <a href={portrait.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {portrait.artist}, {portrait.license}
                </a>
              </p>
            </div>
          ) : (
            polity && <KingdomEmblem polityId={polity.id} color={accent} draw className="h-20 w-20 sm:h-28 sm:w-28" />
          )}

          <div>
            <Eyebrow>{person.role}</Eyebrow>
            <RisingTitle text={person.name} className="mt-2 text-5xl text-ink sm:text-6xl" />
            {person.nativeName && <InkName text={person.nativeName} lang={person.nativeLang} className="mt-2 text-2xl text-ink-muted" />}
            <p className="mt-4 font-display text-xl text-ink">
              {person.period.startQualifier === "unknown" ? formatDateRange(person.period) : person.datesAre === "reign" ? `Ruled ${formatDateRange(person.period)}` : formatPersonDates(person)}
            </p>
            <div className="mt-3">
              <Badge tone={status.sourced ? "neutral" : "uncertainty"}>{status.label}</Badge>
            </div>
          </div>
        </div>

        {polity && personDateKnown && kingdomDatesKnown && (
          <section className="mt-12">
            <h2 className="font-sans text-sm font-medium text-ink-muted">
              Where {lifetimeOnly ? "this lifetime falls" : person.datesAre === "reign" ? "this reign falls" : "these dates fall"} in the history of{" "}
              <Link href={`/polities/${polity.slug}`} transitionTypes={NAV_FORWARD} className="text-ink underline underline-offset-4 hover:[color:var(--bh-accent)]">
                {polity.name}
              </Link>
            </h2>
            <div className="relative mt-4 h-3 bg-stone/60">
              <div
                className="bh-grow-x absolute h-full"
                style={{ left: `${pct(reignStart)}%`, width: `${Math.max(1.5, pct(reignEnd) - pct(reignStart))}%`, backgroundColor: accent }}
              />
            </div>
            <div className="mt-2 flex justify-between font-sans text-xs text-ink-muted">
              <span>Begins {formatDatePoint(polity.period.startQualifier, kingdomStart)}</span>
              <span>{polity.period.endYear === null ? "End not known" : `Ends ${formatDatePoint(polity.period.endQualifier, kingdomEnd)}`}</span>
            </div>
          </section>
        )}

        <Rule className="mt-12" />

        <div className="mt-10 grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <div>
            {person.summary && <p className="bh-dropcap max-w-prose font-sans text-lg leading-relaxed text-ink">{person.summary}</p>}
            {!person.summary && (
              <p className="max-w-prose font-sans text-base leading-relaxed text-ink-muted">
                There is no description for {person.name} yet.
              </p>
            )}

            {reignEvents.length > 0 && (
              <section className="mt-12">
                <h2 className="font-sans text-sm font-medium text-ink-muted">{lifetimeOnly ? "During their lifetime" : person.datesAre === "reign" ? "During the reign" : "During these years"}</h2>
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
                        Show {e.period.startYear} CE on the map
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
                <h2 className="font-sans text-sm font-medium text-ink-muted">Sources</h2>
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
            <section>
              <h2 className="font-sans text-sm font-medium text-ink-muted">People around the same time</h2>
              {contemporaries.length === 0 ? (
                <p className="mt-3 font-sans text-sm text-ink-muted">No other people in the atlas have overlapping dates.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {contemporaries.map((p) => {
                    const theirs = p.polityId ? getPolityById(p.polityId) : undefined;
                    return (
                      <li key={p.id} className="border-t border-border pt-3">
                        <Link href={`/people/${p.slug}`} transitionTypes={NAV_FORWARD} className="group block font-sans text-sm">
                          <span className="text-ink group-hover:underline">{p.name}</span>
                          <span className="block text-xs text-ink-muted">
                            {theirs ? `${theirs.name}, ` : ""}
                            {formatDateRange(p.period)}
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
