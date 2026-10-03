import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { getPolityBySlug, people } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";

export const metadata = { title: "People — BHĀRATA" };

export default function PeopleIndexPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>Semantic exploration</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">People</h1>
      <div className="mt-3">
        <Badge tone="uncertainty">Illustrative prototype data</Badge>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {people.map((person) => {
          const polity = person.polityId ? getPolityBySlug(person.polityId) : undefined;
          return (
            <Link key={person.id} href={`/people/${person.slug}`} className="group flex gap-4 border-t border-border pt-5">
              <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-20 shrink-0" />
              <div>
                <h2 className="font-display text-xl text-ink group-hover:text-territory-selected">
                  {person.name}
                </h2>
                <p className="mt-1 font-sans text-sm text-ink-muted">
                  {person.role}
                  {polity && <> · {polity.name}</>}
                </p>
                <p className="font-sans text-sm text-ink-muted">{formatDateRange(person.period)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
