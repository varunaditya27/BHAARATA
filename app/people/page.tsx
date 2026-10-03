import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { getPolityBySlug, people } from "@/lib/data/prototype";
import { formatPersonDates } from "@/lib/domain/time";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";
import { Shared } from "@/components/primitives/Shared";

export const metadata = { title: "People — BHĀRATA" };

export default function PeopleIndexPage() {
  return (
    <PageTransition>
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>Rulers</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">People</h1>
      <p className="mt-3 max-w-prose font-sans text-ink-muted">
        Kings, emperors and sultans, in order of their reigns, with the kingdoms they ruled.
      </p>
      <div className="mt-3">
        <Badge tone="neutral">Rulers: Wikidata and Wikipedia lists · a few written here and checked against Wikipedia</Badge>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {[...people].sort((a, b) => a.period.startYear - b.period.startYear).map((person) => {
          const polity = person.polityId ? getPolityBySlug(person.polityId) : undefined;
          return (
            <Link key={person.id} href={`/people/${person.slug}`} transitionTypes={NAV_FORWARD} className="group flex gap-4 border-t border-border pt-5">
              <Shared name={transitionNames.personPortrait(person.slug)}>
                <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-20 shrink-0" />
              </Shared>
              <div>
                <h2 className="font-display text-xl text-ink group-hover:text-territory-selected">
                  {person.name}
                </h2>
                <p className="mt-1 font-sans text-sm text-ink-muted">
                  {person.role}
                  {polity && <> · {polity.name}</>}
                </p>
                <p className="font-sans text-sm text-ink-muted">{formatPersonDates(person)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
    </PageTransition>
  );
}
