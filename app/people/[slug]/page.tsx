import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { events, getPolityBySlug, people } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";
import { Shared } from "@/components/primitives/Shared";

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export default async function PersonPage({ params }: PageProps<"/people/[slug]">) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  const polity = person.polityId ? getPolityBySlug(person.polityId) : undefined;
  const relatedEvents = events.filter((e) =>
    person.polityId ? e.polityIds.includes(person.polityId) : false,
  );

  return (
    <PageTransition>
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <div className="flex gap-8">
        <Shared name={transitionNames.personPortrait(person.slug)}>
          <RulerPortrait imageKey={person.imageKey} name={person.name} accentColor={polity?.accentColor} className="w-32 shrink-0" />
        </Shared>
        <div>
          <Eyebrow>{person.role}</Eyebrow>
          <h1 className="mt-1 font-display text-4xl text-ink">{person.name}</h1>
          {person.nativeName && (
            <p className="font-devanagari-display text-lg text-ink-muted">{person.nativeName}</p>
          )}
          <p className="mt-2 font-sans text-ink-muted">{formatDateRange(person.period)}</p>
          <div className="mt-2">
            <Badge tone="uncertainty">Illustrative prototype data</Badge>
          </div>
        </div>
      </div>

      <Rule className="mt-10" />

      {person.summary && (
        <p className="mt-8 max-w-prose font-sans leading-relaxed text-ink">{person.summary}</p>
      )}

      {polity && (
        <p className="mt-6 font-sans text-sm text-ink-muted">
          Ruled{" "}
          <Link href={`/polities/${polity.slug}`} transitionTypes={NAV_FORWARD} className="underline underline-offset-4 text-ink hover:text-territory-selected">
            {polity.name}
          </Link>
        </p>
      )}

      {relatedEvents.length > 0 && (
        <section className="mt-10">
          <Eyebrow>Events</Eyebrow>
          <ul className="mt-3 space-y-2">
            {relatedEvents.map((e) => (
              <li key={e.id} className="font-sans text-sm">
                <span className="text-ink-muted">{formatDateRange(e.period)}</span> <span className="text-ink">{e.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
    </PageTransition>
  );
}
