import Link from "next/link";
import { notFound } from "next/navigation";
import { Rule } from "@/components/primitives/Rule";
import { Tilt } from "@/components/primitives/Tilt";
import { InkName } from "@/components/entity/InkName";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { RisingTitle } from "@/components/entity/RisingTitle";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import type { ImageKey } from "@/lib/domain/types";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { formatDatePoint, formatDateRange, formatPersonDates } from "@/lib/domain/time";



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
  const { getPolityById, milestones: events } = atlasAccess(data);
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  const polity = person.polityId ? getPolityById(person.polityId) : undefined;
  const accent = polity?.accentColor ?? "#3b585e";
  const lifetimeOnly = person.datesAre === "lifetime";
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
    <>
      <div className="bh-accented" style={{ "--bh-accent": accent } as React.CSSProperties}>
        <div className="bh-reading-progress" aria-hidden />
        <section style={{ backgroundColor: accent, color: "#fff7e8" }}>
          <div
            className="mx-auto grid max-w-[1200px] items-end gap-10 px-6 pb-14 pt-20 lg:grid-cols-[minmax(0,1fr)_auto]"
            style={{ minHeight: "min(64vh, 36rem)" }}
          >
            <div className="min-w-0">
              <p className="font-sans text-lg">{person.role}</p>
              <RisingTitle text={person.name} className="mt-3 text-[clamp(3rem,6.6vw,6.75rem)] leading-[0.9] tracking-[-0.03em]" />
              {person.nativeName && <InkName text={person.nativeName} lang={person.nativeLang} className="mt-4 text-3xl" />}
              <p className="mt-6 font-display text-2xl">
                {person.period.startQualifier === "unknown" ? formatDateRange(person.period) : person.datesAre === "reign" ? `Ruled ${formatDateRange(person.period)}` : formatPersonDates(person)}
              </p>
            </div>
            {portrait ? (
              <Tilt className="w-56 lg:w-80">
                <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-full" />
              </Tilt>
            ) : (
              polity && <KingdomEmblem polityId={polity.id} color="#fff7e8" draw className="h-44 w-44 lg:h-60 lg:w-60" />
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[960px] px-4 py-14 sm:px-6">
        {polity && personDateKnown && kingdomDatesKnown && (
          <section className="mt-12">
            <h2 className="font-sans text-sm font-medium text-ink-muted">
              Where {lifetimeOnly ? "this lifetime falls" : person.datesAre === "reign" ? "this reign falls" : "these dates fall"} in the history of{" "}
              <Link href={`/polities/${polity.slug}`} className="text-ink underline underline-offset-4 hover:[color:var(--bh-accent)]">
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
                        <Link href={`/people/${p.slug}`} className="group block font-sans text-sm">
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
      </div>
    </>
  );
}
