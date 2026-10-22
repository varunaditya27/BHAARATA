import Link from "next/link";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { PeopleDirectory, type DirectoryGroup } from "@/components/entity/PeopleDirectory";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Shared } from "@/components/primitives/Shared";
import { images, type ImageKey } from "@/lib/data/images";
import { getRulersForPolity, polities } from "@/lib/data/prototype";
import { formatDateRange, formatPersonDates } from "@/lib/domain/time";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export const metadata = { title: "People — BHĀRATA" };

export default function PeopleIndexPage() {
  const groups: DirectoryGroup[] = [...polities]
    .sort((a, b) => a.period.startYear - b.period.startYear)
    .map((polity) => {
      const rulers = getRulersForPolity(polity.id).sort((a, b) => a.period.startYear - b.period.startYear);
      return { polity, rulers };
    })
    .filter(({ rulers }) => rulers.length > 0)
    .map(({ polity, rulers }) => ({
      id: polity.slug,
      name: polity.name,
      heading: (
        <div key={polity.slug} className="flex items-center gap-4 border-b border-ink/70 pb-3">
          <KingdomEmblem polityId={polity.id} color={polity.accentColor} className="h-11 w-11" />
          <div className="min-w-0">
            <h2 id={`${polity.slug}-name`} className="font-display text-2xl text-ink">
              <Link href={`/polities/${polity.slug}`} transitionTypes={NAV_FORWARD} className="hover:text-territory-selected">
                {polity.name}
              </Link>
            </h2>
            <p className="font-sans text-sm text-ink-muted">
              {formatDateRange(polity.period)}, {rulers.length} {rulers.length === 1 ? "ruler" : "rulers"}
            </p>
          </div>
        </div>
      ),
      rulers: rulers.map((person) => ({
        id: person.id,
        name: person.name,
        row: (
          <Link
            key={person.id}
            href={`/people/${person.slug}`}
            transitionTypes={NAV_FORWARD}
            className="group flex min-h-12 items-center gap-3 border-b border-border py-2"
          >
            <span className="min-w-0 flex-1 font-display text-lg text-ink group-hover:text-territory-selected">{person.name}</span>
            <span className="shrink-0 font-sans text-sm tabular-nums text-ink-muted">{formatPersonDates(person)}</span>
            {person.imageKey && images[person.imageKey as ImageKey] && (
              <Shared name={transitionNames.personPortrait(person.slug)}>
                <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-9 shrink-0" />
              </Shared>
            )}
          </Link>
        ),
      })),
    }));

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl text-ink">People</h1>
        <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">
          Every ruler in the atlas, grouped by kingdom and listed in the order they ruled. The kingdoms run from the
          earliest to the latest.
        </p>
        <p className="mt-3 max-w-prose font-sans text-sm text-ink-muted">
          Most names and dates come from Wikipedia&rsquo;s lists of rulers and from Wikidata, Wikipedia&rsquo;s open
          database. A few were written here and checked against Wikipedia. &ldquo;c.&rdquo; before a year means about.
        </p>

        <div className="mt-10">
          <PeopleDirectory groups={groups} />
        </div>
      </div>
    </PageTransition>
  );
}
