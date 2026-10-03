import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { KingdomLanes } from "@/components/chronology/KingdomLanes";
import { events, getPolityBySlug } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { PROTOTYPE_ERAS } from "@/lib/geo/historical-state";
import { NAV_BACK, NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = {
  title: "Chronology — BHĀRATA",
};

export default function ChronologyPage() {
  const sorted = [...events].sort((a, b) => a.period.startYear - b.period.startYear);
  const groups = PROTOTYPE_ERAS.map((era) => ({
    era,
    items: sorted.filter((e) => e.period.startYear >= era.start && e.period.startYear <= era.end),
  })).filter((g) => g.items.length > 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <Eyebrow>Events in order</Eyebrow>
        <h1 className="mt-2 font-display text-5xl text-ink">Chronology</h1>
        <p className="mt-4 max-w-prose font-sans text-ink-muted">
          Each coloured line shows how long a kingdom lasted, and each diamond marks an event. Click a diamond to
          jump to it below. &ldquo;c.&rdquo; in front of a date means &ldquo;about&rdquo;.
        </p>
        <div className="mt-3">
          <Badge tone="uncertainty">Placeholder data, not yet checked</Badge>
        </div>

        <div className="mt-10">
          <KingdomLanes />
        </div>

        <Rule className="mt-12" />

        <div className="mx-auto max-w-[760px]">
          {groups.map(({ era, items }) => (
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
            </section>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
