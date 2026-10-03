import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HeroPhoto } from "@/components/primitives/HeroPhoto";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { InkName } from "@/components/entity/InkName";
import { RisingTitle } from "@/components/entity/RisingTitle";
import { images, type ImageKey } from "@/lib/data/images";
import { events, getPolityBySlug, places, polities } from "@/lib/data/prototype";
import { placeStatus } from "@/lib/data/status";
import { formatDateRange } from "@/lib/domain/time";
import { boundariesContaining, projectTogether } from "@/lib/geo/silhouette";
import { darkenHex } from "@/lib/utils/color";
import { NAV_BACK, NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/places/[slug]">) {
  const { slug } = await params;
  const place = places.find((p) => p.slug === slug);
  return { title: place ? `${place.name} — BHĀRATA` : "Place — BHĀRATA" };
}

export default async function PlacePage({ params }: PageProps<"/places/[slug]">) {
  const { slug } = await params;
  const place = places.find((p) => p.slug === slug);
  if (!place) notFound();

  const hero = place.imageKey ? images[place.imageKey as ImageKey] : undefined;
  const capitalOf = polities.filter((p) => p.capitals.some((c) => place.name.startsWith(c)));
  const relatedEvents = events.filter((e) => e.placeIds.includes(place.id));
  const status = placeStatus(place);

  // Which recorded kingdoms' territory contains this point, in time order —
  // computed from the boundaries, not hand-entered.
  // A kingdom has many dated border shapes; merge them into one entry per kingdom, with the year ranges
  // it held the place (consecutive shapes join up, a real gap stays a gap) and its latest shape for the map.
  const heldBy: { polity: NonNullable<ReturnType<typeof getPolityBySlug>>; ranges: [number, number][]; boundary: ReturnType<typeof boundariesContaining>[number] }[] = [];
  for (const b of boundariesContaining(place.coordinates)) {
    const polity = getPolityBySlug(b.polityId);
    if (!polity) continue;
    const existing = heldBy.find((h) => h.polity.id === polity.id);
    if (!existing) {
      heldBy.push({ polity, ranges: [[b.validFrom, b.validTo]], boundary: b });
      continue;
    }
    const last = existing.ranges[existing.ranges.length - 1];
    if (b.validFrom <= last[1] + 1) last[1] = Math.max(last[1], b.validTo);
    else existing.ranges.push([b.validFrom, b.validTo]);
    existing.boundary = b;
  }
  const miniMap = heldBy.length > 0 ? projectTogether(heldBy.map((h) => h.boundary.geometry), place.coordinates) : null;
  const firstYear = heldBy[0]?.ranges[0][0] ?? 985;

  const header = (dark: boolean) => (
    <>
      <Eyebrow className={`capitalize ${dark ? "text-paper/70" : ""}`}>
        {place.placeType} · {place.region}
      </Eyebrow>
      <RisingTitle text={place.name} className={`mt-2 text-5xl sm:text-6xl ${dark ? "text-paper" : "text-ink"}`} />
      {place.nativeName && (
        <InkName text={place.nativeName} lang={place.nativeLang} className={`mt-2 text-2xl sm:text-3xl ${dark ? "text-paper/85" : "text-ink-muted"}`} />
      )}
    </>
  );

  return (
    <PageTransition>
      <div>
        {hero && (
          <HeroPhoto credit={hero} sharedName={transitionNames.placePhoto(place.slug)}>
            <div className="flex h-full items-end">
              <div className="mx-auto w-full max-w-[960px] px-4 pb-10 sm:px-6">{header(true)}</div>
            </div>
          </HeroPhoto>
        )}

        <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6">
          {!hero && header(false)}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-sans text-ink-muted">
              {place.coordinates[1].toFixed(3)}°N, {place.coordinates[0].toFixed(3)}°E
            </p>
            <Badge tone={status.sourced ? "neutral" : "uncertainty"}>{status.label}</Badge>
          </div>

          <Rule className="mt-8" />

          <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1.2fr]">
            <section>
              <Eyebrow>Held by</Eyebrow>
              {miniMap ? (
                <>
                  <svg viewBox="0 0 100 100" className="mt-4 w-full max-w-sm" role="img" aria-label={`Kingdoms whose territory included ${place.name}`}>
                    {heldBy.map((h, i) => (
                      <path
                        key={h.polity.id}
                        d={miniMap.paths[i]}
                        fill={h.polity.accentColor}
                        fillOpacity={0.22}
                        stroke={darkenHex(h.polity.accentColor, 0.3)}
                        strokeWidth={0.5}
                        strokeLinejoin="round"
                      />
                    ))}
                    <circle cx={miniMap.point[0]} cy={miniMap.point[1]} r={2.8} fill="none" stroke="var(--bh-ink)" strokeWidth={0.6} />
                    <circle cx={miniMap.point[0]} cy={miniMap.point[1]} r={1.2} fill="var(--bh-ink)" />
                  </svg>
                  <p className="mt-2 font-sans text-xs text-ink-muted">
                    The outlines of every kingdom in the atlas whose land included this place, drawn over each other.
                    The outlines are rough.
                  </p>
                </>
              ) : (
                <p className="mt-3 font-sans text-sm text-ink-muted">No kingdom in the atlas held this place.</p>
              )}
            </section>

            <section>
              <ol className="space-y-5">
                {heldBy.map((h) => (
                  <li key={h.polity.id} className="flex gap-4 border-t border-border pt-4">
                    <span className="mt-1.5 h-3 w-3 shrink-0" style={{ backgroundColor: h.polity.accentColor }} aria-hidden />
                    <div>
                      <Link
                        href={`/polities/${h.polity.slug}`}
                        transitionTypes={NAV_FORWARD}
                        className="font-display text-xl text-ink hover:text-territory-selected"
                      >
                        {h.polity.name}
                      </Link>
                      <p className="font-sans text-sm text-ink-muted">
                        {h.ranges.map(([a, z]) => `c. ${a}–${z}`).join(", ")} CE
                        {capitalOf.some((c) => c.id === h.polity.id) && " · its capital"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {relatedEvents.length > 0 && (
                <div className="mt-10">
                  <Eyebrow>Events here</Eyebrow>
                  <ul className="mt-3 space-y-3">
                    {relatedEvents.map((e) => (
                      <li key={e.id} className="font-sans text-sm">
                        <span className="text-ink-muted">{formatDateRange(e.period)}</span>{" "}
                        <Link href={`/chronology#${e.slug}`} transitionTypes={NAV_FORWARD} className="text-ink underline underline-offset-4">
                          {e.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href={`/atlas?year=${firstYear}`}
                transitionTypes={NAV_BACK}
                className="mt-10 inline-block border border-ink px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                See it on the atlas
              </Link>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
