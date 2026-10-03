import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { KingdomLanes } from "@/components/chronology/KingdomLanes";
import { battles, getPolityBySlug, milestones } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { PROTOTYPE_ERAS } from "@/lib/geo/historical-state";
import { NAV_BACK, NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = {
  title: "Chronology — BHĀRATA",
};

export default function ChronologyPage() {
  const byYear = (a: { period: { startYear: number } }, b: { period: { startYear: number } }) => a.period.startYear - b.period.startYear;
  const inEra = (era: { start: number; end: number }) => (e: { period: { startYear: number } }) =>
    e.period.startYear >= era.start && e.period.startYear <= era.end;
  const groups = PROTOTYPE_ERAS.map((era) => ({
    era,
    items: [...milestones].sort(byYear).filter(inEra(era)),
    fights: [...battles].sort(byYear).filter(inEra(era)),
  })).filter((g) => g.items.length > 0 || g.fights.length > 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <Eyebrow>Events in order</Eyebrow>
        <h1 className="mt-2 font-display text-5xl text-ink">Chronology</h1>
        <p className="mt-4 max-w-prose font-sans text-ink-muted">
          Each coloured line shows how long a kingdom lasted, and each diamond marks a turning point. Click a diamond
          to jump to it below. Under each period you&rsquo;ll also find its battles. &ldquo;c.&rdquo; in front of a date
          means &ldquo;about&rdquo;.
        </p>
        <div className="mt-3">
          <Badge tone="neutral">Battles: Wikidata and Wikipedia · turning points: written here, checked against Wikipedia</Badge>
        </div>

        <div className="mt-10">
          <KingdomLanes />
        </div>

        <Rule className="mt-12" />

        <div className="mx-auto max-w-[760px]">
          {groups.map(({ era, items, fights }) => (
            <section key={era.name} className="relative mt-16">
              <p className="bh-outline-numeral pointer-events-none select-none font-display text-[5.5rem] leading-none sm:text-[8rem]" aria-hidden>
                {era.start}
              </p>
              <div className="sticky top-16 z-10 mb-8 border-b border-border bg-paper/95 py-2 backdrop-blur-sm">
                <h2 className="font-sans text-xs uppercase tracking-[0.16em] text-ink">
                  {era.name} <span className="text-ink-muted">· {era.start}–{era.end}</span>
                </h2>
              </div>

              <ol className="relative space-y-12 border-l border-border pl-8">
                {items.map((event) => {
                  const lead = getPolityBySlug(event.polityIds[0]);
                  return (
                    <li key={event.id} id={event.slug} className="bh-reveal relative scroll-mt-32">
                      <span
                        className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rotate-45 border-2 border-paper"
                        style={{ backgroundColor: lead?.accentColor ?? "var(--bh-ink)" }}
                        aria-hidden
                      />
                      <p className="font-sans text-sm tabular-nums text-ink-muted">{formatDateRange(event.period)}</p>
                      <h3 className="mt-1 font-display text-2xl text-ink">{event.title}</h3>
                      <p className="mt-2 max-w-prose font-sans leading-relaxed text-ink-muted">{event.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm">
                        {event.polityIds.map((id) => {
                          const polity = getPolityBySlug(id);
                          if (!polity) return null;
                          return (
                            <Link
                              key={id}
                              href={`/polities/${polity.slug}`}
                              transitionTypes={NAV_FORWARD}
                              className="text-ink underline underline-offset-4 hover:text-territory-selected"
                            >
                              {polity.name}
                            </Link>
                          );
                        })}
                        <Link
                          href={`/atlas?year=${event.period.startYear}${lead ? `&polity=${lead.slug}` : ""}`}
                          transitionTypes={NAV_BACK}
                          className="text-ink-muted underline underline-offset-4 hover:text-ink"
                        >
                          See {event.period.startYear} on the atlas
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {fights.length > 0 && (
                <div className="mt-14">
                  <h3 className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                    Battles of this period ({fights.length})
                  </h3>
                  <ul className="mt-3 divide-y divide-border border-y border-border">
                    {fights.map((b) => (
                      <li key={b.id} id={b.slug} className="scroll-mt-32 py-3 font-sans">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className="w-12 shrink-0 text-sm tabular-nums text-ink-muted">{b.period.startYear}</span>
                          <Link
                            href={`/atlas?year=${b.period.startYear}`}
                            transitionTypes={NAV_BACK}
                            className="font-display text-lg text-ink underline-offset-4 hover:underline"
                          >
                            {b.title}
                          </Link>
                          {b.polityIds.length > 0 && (
                            <span className="text-xs text-ink-muted">
                              in {b.polityIds.map((id) => getPolityBySlug(id)?.name).filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 max-w-prose pl-[3.75rem] text-sm leading-relaxed text-ink-muted">{b.summary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
