import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { HeroPhoto } from "@/components/primitives/HeroPhoto";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { EntityTabs } from "@/components/primitives/EntityTabs";
import { RulerPortrait } from "@/components/entity/RulerPortrait";
import {
  evidence as evidenceData,
  events,
  getPolityBySlug,
  getRulersForPolity,
  getSourceById,
  places,
  polities,
} from "@/lib/data/prototype";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";
import { polityPhotoTransitionName } from "@/lib/utils/view-transition";

export function generateStaticParams() {
  return polities.map((p) => ({ slug: p.slug }));
}

export default async function PolityPage({ params }: PageProps<"/polities/[slug]">) {
  const { slug } = await params;
  const polity = getPolityBySlug(slug);
  if (!polity) notFound();

  const hero = polity.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  const rulers = getRulersForPolity(polity.id);
  const relatedEvents = events.filter((e) => e.polityIds.includes(polity.id));
  const relatedPlaces = places.filter((p) => polity.capitals.includes(p.name));
  const relatedEvidence = evidenceData.filter((e) => e.polityIds.includes(polity.id));
  const sourceRecords = polity.provenance
    .map((p) => getSourceById(p.sourceId))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const otherPolities = polities.filter((p) => p.id !== polity.id);

  const overviewTab = (
    <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
      <div>
        <p className="max-w-prose font-sans leading-relaxed text-ink">{polity.summary}</p>
        {sourceRecords.length > 0 && (
          <div className="mt-10">
            <Eyebrow>Selected sources</Eyebrow>
            <ul className="mt-3 space-y-2">
              {sourceRecords.map((s) => (
                <li key={s.id} className="font-sans text-sm text-ink">
                  {s.title}
                  <span className="block text-xs text-ink-muted">{s.citation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="space-y-6 font-sans text-sm">
        <div>
          <Eyebrow>Capital{polity.capitals.length > 1 ? "s" : ""}</Eyebrow>
          <p className="mt-1 text-ink">{polity.capitals.join(", ")}</p>
        </div>
        {polity.language && (
          <div>
            <Eyebrow>Language</Eyebrow>
            <p className="mt-1 text-ink">{polity.language}</p>
          </div>
        )}
        {polity.religion && (
          <div>
            <Eyebrow>Religion</Eyebrow>
            <p className="mt-1 text-ink">{polity.religion}</p>
          </div>
        )}
        {polity.notableFor && (
          <div>
            <Eyebrow>Notable for</Eyebrow>
            <p className="mt-1 text-ink">{polity.notableFor}</p>
          </div>
        )}
        <div>
          <Eyebrow>Alternative names</Eyebrow>
          <p className="mt-1 text-ink">{polity.alternativeNames.join(", ") || "—"}</p>
        </div>
      </div>
    </div>
  );

  const rulersTab = (
    <div className="grid gap-8 sm:grid-cols-3">
      {rulers.map((ruler) => (
        <Link key={ruler.id} href={`/people/${ruler.slug}`} className="group block">
          <RulerPortrait
            imageKey={ruler.imageKey}
            name={ruler.name}
            accentColor={polity.accentColor}
            className="w-full"
          />
          <h3 className="mt-3 font-display text-lg text-ink group-hover:text-territory-selected">
            {ruler.name}
          </h3>
          <p className="font-sans text-xs text-ink-muted">{formatDateRange(ruler.period)}</p>
        </Link>
      ))}
      {rulers.length === 0 && (
        <p className="font-sans text-sm text-ink-muted">No rulers recorded yet for this entity.</p>
      )}
    </div>
  );

  const placesTab = (
    <div className="grid gap-8 sm:grid-cols-2">
      {relatedPlaces.map((place) => (
        <Link key={place.id} href={`/places/${place.slug}`} className="group block border-t border-border pt-4">
          <h3 className="font-display text-xl text-ink group-hover:text-territory-selected">{place.name}</h3>
          <p className="font-sans text-sm text-ink-muted">{place.placeType} · {place.region}</p>
        </Link>
      ))}
      {relatedPlaces.length === 0 && (
        <p className="font-sans text-sm text-ink-muted">No places recorded yet.</p>
      )}
    </div>
  );

  const eventsTab = (
    <ul className="space-y-6">
      {relatedEvents.map((event) => (
        <li key={event.id} className="border-t border-border pt-4">
          <p className="font-sans text-sm text-ink-muted">{formatDateRange(event.period)}</p>
          <h3 className="mt-1 font-display text-xl text-ink">{event.title}</h3>
          <p className="mt-1 max-w-prose font-sans text-sm leading-relaxed text-ink-muted">
            {event.summary}
          </p>
        </li>
      ))}
      {relatedEvents.length === 0 && (
        <p className="font-sans text-sm text-ink-muted">No events recorded yet.</p>
      )}
    </ul>
  );

  const evidenceTab = (
    <ul className="space-y-6">
      {relatedEvidence.map((ev) => (
        <li key={ev.id} className="border-t border-border pt-4">
          <Link href={`/evidence/${ev.slug}`} className="group block">
            <p className="font-sans text-sm text-ink-muted">{formatDateRange(ev.period)} · {ev.evidenceType}</p>
            <h3 className="mt-1 font-display text-xl text-ink group-hover:text-territory-selected">
              {ev.title}
            </h3>
          </Link>
        </li>
      ))}
      {relatedEvidence.length === 0 && (
        <p className="font-sans text-sm text-ink-muted">No evidence records linked yet.</p>
      )}
    </ul>
  );

  const relatedTab = (
    <div className="grid gap-8 sm:grid-cols-3">
      {otherPolities.map((p) => (
        <Link key={p.id} href={`/polities/${p.slug}`} className="group block border-t border-border pt-4">
          <h3 className="font-display text-xl text-ink group-hover:text-territory-selected">{p.name}</h3>
          <p className="font-sans text-sm text-ink-muted">{formatDateRange(p.period)}</p>
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      {hero && (
        <HeroPhoto credit={hero} viewTransitionName={polityPhotoTransitionName(polity.slug)}>
          <div className="flex h-full items-end">
            <div className="mx-auto w-full max-w-[1100px] px-6 pb-10">
              <Eyebrow className="text-paper/70">{polity.polityType} · {polity.region}</Eyebrow>
              <h1 className="mt-2 font-display text-6xl text-paper">{polity.name}</h1>
              {polity.nativeName && (
                <p className="mt-1 font-devanagari-display text-2xl text-paper/80">{polity.nativeName}</p>
              )}
              {polity.quote && (
                <p className="mt-3 max-w-xl font-sans italic text-paper/80">&ldquo;{polity.quote}&rdquo;</p>
              )}
            </div>
          </div>
        </HeroPhoto>
      )}

      <div className="mx-auto max-w-[1100px] px-6 py-12">
        {!hero && (
          <>
            <Eyebrow>{polity.polityType} · {polity.region}</Eyebrow>
            <h1 className="mt-2 font-display text-5xl text-ink">{polity.name}</h1>
          </>
        )}
        <p className="mt-3 font-sans text-ink-muted">{formatDateRange(polity.period)}</p>
        <div className="mt-3">
          <Badge tone="uncertainty">Illustrative prototype data</Badge>
        </div>

        <div className="mt-10">
          <EntityTabs
            defaultValue="overview"
            items={[
              { value: "overview", label: "Overview", content: overviewTab },
              { value: "rulers", label: "Rulers", content: rulersTab },
              { value: "places", label: "Places", content: placesTab },
              { value: "events", label: "Events", content: eventsTab },
              { value: "evidence", label: "Evidence", content: evidenceTab },
              { value: "related", label: "Related", content: relatedTab },
            ]}
          />
        </div>

        <p className="mt-16 border-t border-border pt-6 font-sans text-sm text-ink-muted">
          <Link
            href={`/atlas?polity=${polity.slug}&year=${polity.period.startYear}`}
            className="underline underline-offset-4 text-ink hover:text-territory-selected"
          >
            View {polity.name} on the atlas →
          </Link>
        </p>
      </div>
    </div>
  );
}
