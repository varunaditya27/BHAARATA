import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";
import { events, getPolityBySlug } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { getEraForYear } from "@/lib/geo/historical-state";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_BACK, NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = {
  title: "Chronology — BHĀRATA",
};

export default function ChronologyPage() {
  const sorted = [...events].sort((a, b) => a.period.startYear - b.period.startYear);

  const groups: { era: string; items: typeof sorted }[] = [];
  for (const event of sorted) {
    const era = getEraForYear(event.period.startYear);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.era === era) {
      lastGroup.items.push(event);
    } else {
      groups.push({ era, items: [event] });
    }
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <Eyebrow>Temporal exploration</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Chronology</h1>
      <p className="mt-4 font-sans text-ink-muted">
        Events in sequence, grouped by era. Dates preserve whatever
        uncertainty the record carries — nothing here is rounded to a
        cleaner number than the underlying claim supports.
      </p>
      <div className="mt-3">
        <Badge tone="uncertainty">Illustrative prototype data</Badge>
      </div>

      <Rule className="mt-10" />

      <div className="relative mt-10">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />

        {groups.map((group) => (
          <section key={group.era} className="mb-12 last:mb-0">
            <div className="sticky top-4 z-10 mb-6 flex items-center gap-3 bg-paper/95 py-1 pr-4 backdrop-blur-sm">
              <span className="relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink bg-paper" aria-hidden />
              <Eyebrow>{group.era}</Eyebrow>
            </div>

            <ol className="space-y-10 pl-8">
              {group.items.map((event) => (
                <li key={event.id} id={event.slug} className="bh-reveal relative">
                  <span
                    className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full bg-territory"
                    aria-hidden
                  />
                  <p className="font-sans text-sm text-ink-muted">{formatDateRange(event.period)}</p>
                  <h2 className="mt-1 font-display text-2xl text-ink">{event.title}</h2>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
                    {event.summary}
                  </p>
                  <div className="mt-3 flex gap-4 font-sans text-sm">
                    {event.polityIds.map((id) => {
                      const polity = getPolityBySlug(id);
                      if (!polity) return null;
                      return (
                        <Link
                          key={id}
                          href={`/polities/${polity.slug}`}
                          transitionTypes={NAV_FORWARD}
                          className="underline underline-offset-4 text-ink hover:text-territory-selected"
                        >
                          {polity.name}
                        </Link>
                      );
                    })}
                    <Link
                      href={`/atlas?year=${event.period.startYear}`}
                      transitionTypes={NAV_BACK}
                      className="underline underline-offset-4 text-ink-muted hover:text-ink"
                    >
                      View on the atlas →
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}
