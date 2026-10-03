import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";
import { HeroPhoto } from "@/components/primitives/HeroPhoto";
import { events, places, polities } from "@/lib/data/prototype";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_BACK, NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export default async function PlacePage({ params }: PageProps<"/places/[slug]">) {
  const { slug } = await params;
  const place = places.find((p) => p.slug === slug);
  if (!place) notFound();

  const hero = place.imageKey ? images[place.imageKey as ImageKey] : undefined;
  const associatedPolities = polities.filter((p) => p.capitals.includes(place.name));
  const relatedEvents = events.filter((e) => e.placeIds.includes(place.id));

  const header = (
    <>
      <Eyebrow className={hero ? "text-paper/70" : undefined}>{place.placeType} · {place.region}</Eyebrow>
      <h1 className={`mt-2 font-display text-5xl ${hero ? "text-paper" : "text-ink"}`}>{place.name}</h1>
    </>
  );

  return (
    <PageTransition>
    <div>
      {hero ? (
        <HeroPhoto credit={hero} sharedName={transitionNames.placePhoto(place.slug)}>
          <div className="flex h-full items-end">
            <div className="mx-auto w-full max-w-[760px] px-6 pb-10">{header}</div>
          </div>
        </HeroPhoto>
      ) : null}

      <div className="mx-auto max-w-[760px] px-6 py-12">
        {!hero && header}
        <div className="mt-3">
          <Badge tone="uncertainty">Illustrative prototype data</Badge>
        </div>

        <Rule className="mt-8" />

        <div className="mt-8 grid grid-cols-2 gap-6 font-sans text-sm">
          <div>
            <Eyebrow>Coordinates</Eyebrow>
            <p className="mt-1 text-ink">
              {place.coordinates[1].toFixed(3)}°N, {place.coordinates[0].toFixed(3)}°E
            </p>
          </div>
          {associatedPolities.length > 0 && (
            <div>
              <Eyebrow>Capital of</Eyebrow>
              <p className="mt-1 text-ink">
                {associatedPolities.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && ", "}
                    <Link href={`/polities/${p.slug}`} transitionTypes={NAV_FORWARD} className="underline underline-offset-4 hover:text-territory-selected">
                      {p.name}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        {relatedEvents.length > 0 && (
          <section className="mt-10">
            <Eyebrow>Events here</Eyebrow>
            <ul className="mt-3 space-y-2">
              {relatedEvents.map((e) => (
                <li key={e.id} className="font-sans text-sm">
                  <span className="text-ink-muted">{formatDateRange(e.period)}</span>{" "}
                  <span className="text-ink">{e.title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 font-sans text-sm text-ink-muted">
          <Link
            href={`/atlas?year=985`}
            transitionTypes={NAV_BACK}
            className="underline underline-offset-4 text-ink hover:text-territory-selected"
          >
            View on the atlas →
          </Link>
        </p>
      </div>
    </div>
    </PageTransition>
  );
}
