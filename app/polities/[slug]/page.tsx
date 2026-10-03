import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { EntityTabs } from "@/components/primitives/EntityTabs";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HeroPhoto } from "@/components/primitives/HeroPhoto";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Plate } from "@/components/primitives/Plate";
import { Shared } from "@/components/primitives/Shared";
import { InkName } from "@/components/entity/InkName";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { contemporariesOf, KingdomLifespan } from "@/components/entity/KingdomLifespan";
import { RisingTitle } from "@/components/entity/RisingTitle";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { images, type ImageKey } from "@/lib/data/images";
import {
  evidence as evidenceData,
  events,
  getPolityBySlug,
  getRulersForPolity,
  getSourceById,
  places,
  polities,
} from "@/lib/data/prototype";
import { polityStatus } from "@/lib/data/status";
import { formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { NAV_BACK, NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export function generateStaticParams() {
  return polities.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/polities/[slug]">) {
  const { slug } = await params;
  const polity = getPolityBySlug(slug);
  return { title: polity ? `${polity.name} — BHĀRATA` : "Kingdom — BHĀRATA", description: polity?.summary };
}

export default async function PolityPage({ params }: PageProps<"/polities/[slug]">) {
  const { slug } = await params;
  const polity = getPolityBySlug(slug);
  if (!polity) notFound();

  const hero = polity.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  const rulers = getRulersForPolity(polity.id).sort((a, b) => a.period.startYear - b.period.startYear);
  const relatedEvents = events
    .filter((e) => e.category !== "battle" && e.polityIds.includes(polity.id))
    .sort((a, b) => a.period.startYear - b.period.startYear);
  const relatedBattles = events
    .filter((e) => e.category === "battle" && e.polityIds.includes(polity.id))
    .sort((a, b) => a.period.startYear - b.period.startYear);
  const relatedPlaces = places.filter((p) => polity.capitals.some((c) => p.name.startsWith(c)));
  const relatedEvidence = evidenceData.filter((e) => e.polityIds.includes(polity.id));
  const sourceRecords = polity.provenance
    .map((p) => getSourceById(p.sourceId))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const contemporaries = contemporariesOf(polity);
  const status = polityStatus(polity);
  const span = (polity.period.endYear ?? polity.period.startYear) - polity.period.startYear;

  const overviewTab = (
    <div className="grid gap-14 md:grid-cols-[1.6fr_1fr]">
      <div>
        <p className="bh-dropcap max-w-prose font-sans text-lg leading-relaxed text-ink">{polity.summary}</p>
        {polity.notableFor && (
          <p className="bh-accent-rule mt-6 max-w-prose border-l-2 pl-4 font-sans text-ink-muted">
            <span className="text-ink">Remembered for:</span> {polity.notableFor}.
          </p>
        )}

        <section className="mt-12">
          <Eyebrow>Who else was around</Eyebrow>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            {polity.name} lasted about {span} years (between the dashed lines). The bars below are the other kingdoms of
            the time — darker where their years overlap.
          </p>
          <div className="mt-5">
            <KingdomLifespan polity={polity} />
          </div>
        </section>

        {sourceRecords.length > 0 && (
          <section className="mt-12">
            <Eyebrow>Sources</Eyebrow>
            <ul className="mt-3 space-y-3">
              {sourceRecords.map((s) => (
                <li key={s.id} className="border-t border-border pt-3 font-sans text-sm text-ink">
                  {s.title}
                  <span className="block text-xs text-ink-muted">{s.citation}</span>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs underline underline-offset-4">
                      Open the source
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="bh-accent-rule h-fit border-t-2 pt-5 font-sans text-sm md:sticky md:top-24">
        <Eyebrow>At a glance</Eyebrow>
        <dl className="mt-4 space-y-4">
          {polity.capitals.length > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Capital{polity.capitals.length > 1 ? "s" : ""}</dt>
              <dd className="mt-0.5 text-ink">{polity.capitals.join(", ")}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Region</dt>
            <dd className="mt-0.5 text-ink">{polity.region}</dd>
          </div>
          {polity.language && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Language</dt>
              <dd className="mt-0.5 text-ink">{polity.language}</dd>
            </div>
          )}
          {polity.religion && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Religion</dt>
              <dd className="mt-0.5 text-ink">{polity.religion}</dd>
            </div>
          )}
          {polity.alternativeNames.length > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Also known as</dt>
              <dd className="mt-0.5 text-ink">{polity.alternativeNames.join(", ")}</dd>
            </div>
          )}
          {rulers.length + relatedEvents.length + relatedEvidence.length > 0 && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">In this atlas</dt>
            <dd className="mt-0.5 text-ink">
              {rulers.length} {rulers.length === 1 ? "ruler" : "rulers"} · {relatedEvents.length}{" "}
              {relatedEvents.length === 1 ? "event" : "events"} · {relatedEvidence.length} evidence{" "}
              {relatedEvidence.length === 1 ? "record" : "records"}
            </dd>
          </div>
          )}
        </dl>
        <Link
          href={`/atlas?polity=${polity.slug}&year=${polity.period.startYear}`}
          transitionTypes={NAV_BACK}
          className="mt-6 block border border-ink px-4 py-2 text-center text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          See it on the atlas
        </Link>
      </aside>
    </div>
  );

  const rulersTab =
    rulers.length === 0 ? (
      <p className="font-sans text-sm text-ink-muted">No rulers recorded yet for this kingdom.</p>
    ) : (
      <div>
        <Eyebrow>{rulers.some((r) => r.datesAre === "lifetime") ? "Reigns (paler bars: only the lifetime is known)" : "Reigns"}</Eyebrow>
        <div className="relative mt-4 h-10 border-b border-border">
          {rulers.map((r) => {
            const start = polity.period.startYear;
            const total = Math.max(1, (polity.period.endYear ?? start) - start);
            // Ruler dates (Wikidata) and kingdom dates (Cliopatria) can disagree by a few years: clamp to the track.
            const left = Math.min(99, Math.max(0, ((r.period.startYear - start) / total) * 100));
            const right = Math.min(100, ((r.period.endYear ?? r.period.startYear) - start) / total * 100);
            const width = Math.max(1.2, Math.min(100 - left, right - left));
            return (
              <div key={r.id} className="absolute bottom-0" style={{ left: `${left}%`, width: `${width}%` }} title={`${r.name}, ${formatPersonDates(r)}`}>
                <div className="h-2" style={{ backgroundColor: polity.accentColor, opacity: r.datesAre === "lifetime" ? 0.4 : 1 }} />
                {/* Names only when there are few enough not to overlap; otherwise hover for the name. */}
                {rulers.length <= 8 && (
                  <span className="absolute bottom-3 left-0 whitespace-nowrap font-sans text-[0.7rem] text-ink-muted">
                    {r.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between font-sans text-[0.65rem] text-ink-muted">
          <span>{polity.period.startYear}</span>
          <span>{polity.period.endYear}</span>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {rulers.map((ruler) => (
            <Link key={ruler.id} href={`/people/${ruler.slug}`} transitionTypes={NAV_FORWARD} className="group block">
              <Shared name={transitionNames.personPortrait(ruler.slug)}>
                <RulerPortrait imageKey={ruler.imageKey} name={ruler.name} accentColor={polity.accentColor} className="w-full" />
              </Shared>
              <h3 className="mt-3 font-display text-lg text-ink transition-colors group-hover:[color:var(--bh-accent)]">
                {ruler.name}
              </h3>
              <p className="font-sans text-xs text-ink-muted">{ruler.role} · {formatPersonDates(ruler)}</p>
              {ruler.summary && <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-ink-muted">{ruler.summary}</p>}
            </Link>
          ))}
        </div>
      </div>
    );

  const placesTab =
    relatedPlaces.length === 0 ? (
      <p className="font-sans text-sm text-ink-muted">No places recorded yet.</p>
    ) : (
      <div className="grid gap-10 sm:grid-cols-2">
        {relatedPlaces.map((place, i) => {
          const photo = place.imageKey ? images[place.imageKey as ImageKey] : undefined;
          return (
            <Link key={place.id} href={`/places/${place.slug}`} transitionTypes={NAV_FORWARD} className="group block">
              {photo && (
                <Shared name={transitionNames.placePhoto(place.slug)}>
                  <Plate credit={photo} number={i + 1} />
                </Shared>
              )}
              <h3 className="mt-3 font-display text-xl text-ink transition-colors group-hover:[color:var(--bh-accent)]">
                {place.name}
              </h3>
              <p className="font-sans text-sm capitalize text-ink-muted">
                {place.placeType} · {place.region}
              </p>
            </Link>
          );
        })}
      </div>
    );

  const battlesList =
    relatedBattles.length > 0 ? (
      <div className={relatedEvents.length > 0 ? "mt-12" : ""}>
        <Eyebrow>Battles fought within its borders ({relatedBattles.length})</Eyebrow>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {relatedBattles.map((b) => (
            <li key={b.id} className="py-3 font-sans">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="w-12 shrink-0 text-sm tabular-nums text-ink-muted">{b.period.startYear}</span>
                <Link href={`/chronology#${b.slug}`} transitionTypes={NAV_FORWARD} className="font-display text-lg text-ink underline-offset-4 hover:underline">
                  {b.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-muted">
          Listed by where the battle was fought, not who fought it: the borders come from Cliopatria.
        </p>
      </div>
    ) : null;

  const eventsTab =
    relatedEvents.length + relatedBattles.length === 0 ? (
      <p className="font-sans text-sm text-ink-muted">No events recorded yet.</p>
    ) : (
      <>
        {relatedEvents.length > 0 && (
      <ol className="bh-accent-rule relative space-y-8 border-l pl-6">
        {relatedEvents.map((event) => (
          <li key={event.id} className="bh-reveal relative">
            <span className="absolute -left-[29px] top-1.5 h-2 w-2 rotate-45" style={{ backgroundColor: polity.accentColor }} aria-hidden />
            <p className="font-sans text-sm text-ink-muted">{formatDateRange(event.period)}</p>
            <h3 className="mt-1 font-display text-xl text-ink">{event.title}</h3>
            <p className="mt-1 max-w-prose font-sans text-sm leading-relaxed text-ink-muted">{event.summary}</p>
            <Link
              href={`/atlas?year=${event.period.startYear}&polity=${polity.slug}`}
              transitionTypes={NAV_BACK}
              className="mt-2 inline-block font-sans text-xs text-ink underline underline-offset-4"
            >
              See {event.period.startYear} on the atlas
            </Link>
          </li>
        ))}
      </ol>
        )}
        {battlesList}
      </>
    );

  const evidenceTab =
    relatedEvidence.length === 0 ? (
      <p className="font-sans text-sm text-ink-muted">No evidence added yet.</p>
    ) : (
      <ul className="space-y-6">
        {relatedEvidence.map((ev) => (
          <li key={ev.id} className="border-t border-border pt-4">
            <Link href={`/evidence/${ev.slug}`} transitionTypes={NAV_FORWARD} className="group block">
              <p className="font-sans text-sm capitalize text-ink-muted">
                {formatDateRange(ev.period)} · {ev.evidenceType}
              </p>
              <h3 className="mt-1 font-display text-xl text-ink transition-colors group-hover:[color:var(--bh-accent)]">
                {ev.title}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    );

  const relatedTab =
    contemporaries.length === 0 ? (
      <p className="font-sans text-sm text-ink-muted">No other kingdom in the atlas existed at the same time.</p>
    ) : (
      <div>
        <p className="max-w-prose font-sans text-sm text-ink-muted">
          Other kingdoms that existed at the same time as {polity.name}, and the years they shared.
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {contemporaries.map(({ polity: p, from, to }) => (
            <Link key={p.id} href={`/polities/${p.slug}`} transitionTypes={NAV_FORWARD} className="group flex gap-4 border-t border-border pt-4">
              <KingdomEmblem polityId={p.id} color={p.accentColor} className="h-12 w-12" />
              <div>
                <h3 className="font-display text-xl text-ink group-hover:text-territory-selected">{p.name}</h3>
                <p className="font-sans text-sm text-ink-muted">
                  Both existed {from}–{to} ({to - from} years)
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );

  const title = (dark: boolean) => (
    <>
      <KingdomEmblem
        polityId={polity.id}
        color={polity.accentColor}
        draw
        className="mb-4 h-16 w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
      />
      <Eyebrow className={dark ? "text-paper/70" : undefined}>
        {polity.polityType} · {polity.region}
      </Eyebrow>
      <RisingTitle text={polity.name} className={`mt-2 text-5xl sm:text-7xl ${dark ? "text-paper" : "text-ink"}`} />
      {polity.nativeName && (
        <InkName text={polity.nativeName} lang={polity.nativeLang} className={`mt-2 text-2xl sm:text-3xl ${dark ? "text-paper/85" : "text-ink-muted"}`} />
      )}
      {polity.quote && (
        <p className={`bh-fade-in mt-4 max-w-xl font-sans text-lg ${dark ? "text-paper/80" : "text-ink-muted"}`} style={{ animationDelay: "1200ms" }}>
          {polity.quote}
        </p>
      )}
    </>
  );

  return (
    <PageTransition>
      <div className="bh-accented" style={{ "--bh-accent": polity.accentColor } as React.CSSProperties}>
        <div className="bh-reading-progress" aria-hidden />
        {hero ? (
          <HeroPhoto credit={hero} sharedName={transitionNames.polityPhoto(polity.slug)} heightClassName="h-[62vh] min-h-[420px]">
            <div className="flex h-full items-end">
              <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 sm:px-6">{title(true)}</div>
            </div>
          </HeroPhoto>
        ) : (
          <div className="mx-auto max-w-[1100px] px-4 pt-16 sm:px-6">{title(false)}</div>
        )}

        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-display text-xl text-ink">{formatDateRange(polity.period)}</p>
            <Badge tone={status.sourced ? "neutral" : "uncertainty"}>{status.label}</Badge>
          </div>

          <div className="mt-8">
            <EntityTabs
              defaultValue="overview"
              items={[
                { value: "overview", label: "Overview", content: overviewTab },
                { value: "rulers", label: `Rulers (${rulers.length})`, content: rulersTab, show: rulers.length > 0 },
                { value: "places", label: `Places (${relatedPlaces.length})`, content: placesTab, show: relatedPlaces.length > 0 },
                { value: "events", label: `Events (${relatedEvents.length + relatedBattles.length})`, content: eventsTab, show: relatedEvents.length + relatedBattles.length > 0 },
                { value: "evidence", label: `Evidence (${relatedEvidence.length})`, content: evidenceTab, show: relatedEvidence.length > 0 },
                { value: "related", label: `Same period (${contemporaries.length})`, content: relatedTab, show: contemporaries.length > 0 },
              ].filter((item) => item.show !== false)}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
