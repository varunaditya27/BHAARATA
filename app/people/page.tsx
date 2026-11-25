import Link from "next/link";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { PeopleDirectory, type DirectoryGroup } from "@/components/entity/PeopleDirectory";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import { PageHero } from "@/components/primitives/PageHero";
import { HERO } from "@/lib/hero";
import type { ImageKey } from "@/lib/domain/types";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { byStart, formatDateRange, formatPersonDates } from "@/lib/domain/time";

export const metadata = { title: "People — BHĀRATA" };

export default async function PeopleIndexPage() {
  const data = await getAtlasData();
  const { images, polities } = data;
  const { getRulersForPolity } = atlasAccess(data);
  const groups: DirectoryGroup[] = [...polities]
    .sort((a, b) => a.period.startYear - b.period.startYear)
    .map((polity) => {
      const rulers = getRulersForPolity(polity.id).sort(byStart);
      return { polity, rulers };
    })
    .filter(({ rulers }) => rulers.length > 0)
    .map(({ polity, rulers }) => ({
      id: polity.slug,
      name: polity.name,
      heading: (
        <div
          key={polity.slug}
          className="bh-reveal relative mt-4 flex items-end justify-between overflow-hidden px-6 py-7 sm:px-8"
          style={{ backgroundColor: polity.accentColor, color: "#f2f7fc" }}
        >
          <div className="min-w-0">
            <h2 id={`${polity.slug}-name`} className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em]">
              <Link href={`/polities/${polity.slug}`} className="hover:underline hover:decoration-2 hover:underline-offset-8">
                {polity.name}
              </Link>
            </h2>
            <p className="mt-3 font-sans text-base">
              {formatDateRange(polity.period)}, {rulers.length} {rulers.length === 1 ? "ruler" : "rulers"}
            </p>
          </div>
          <KingdomEmblem polityId={polity.id} color="#f2f7fc" className="-mb-4 -mr-2 h-32 w-32 shrink-0 sm:h-40 sm:w-40" />
        </div>
      ),
      rulers: rulers.map((person) => ({
        id: person.id,
        name: person.name,
        row: (
          <Link
            key={person.id}
            href={`/people/${person.slug}`}
            className="bh-lift group flex min-h-12 items-center gap-3 border-b border-border px-2 py-2"
          >
            <span className="min-w-0 flex-1 font-display text-lg text-ink group-hover:text-territory-selected">{person.name}</span>
            <span className="shrink-0 font-sans text-sm tabular-nums text-ink-muted">{formatPersonDates(person)}</span>
            {person.imageKey && images[person.imageKey as ImageKey] && (
              <RulerPortrait imageKey={person.imageKey} name={person.name} className="w-9 shrink-0" />
            )}
          </Link>
        ),
      })),
    }));

  return (
    <>
      <PageHero
        title="People"
        intro="Every ruler in the atlas, grouped by kingdom and in the order they ruled."
        hero={HERO.people}
      />
      <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6">
        <p className="max-w-prose font-sans text-sm text-ink-muted">
          Names and dates come from Wikipedia&rsquo;s lists of rulers and from Wikidata. &ldquo;c.&rdquo; before a year means about; some dates describe a lifetime rather than a reign.
        </p>
        <div className="mt-8">
          <PeopleDirectory groups={groups} />
        </div>
      </div>
    </>
  );
}
