import Link from "next/link";
import { PlacesAtlas, type PlaceGroup } from "@/components/entity/PlacesAtlas";
import { PageHero } from "@/components/primitives/PageHero";
import { PageTransition } from "@/components/primitives/PageTransition";
import { PortraitStack } from "@/components/primitives/PortraitStack";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { placeKindLabel } from "@/lib/domain/labels";
import { AREA_ORDER, broadArea } from "@/lib/geo/areas";
import { boundariesContaining, polityGeometry, projectTogether } from "@/lib/geo/silhouette";
import type { ImageKey } from "@/lib/domain/types";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Places — BHĀRATA" };

export default async function PlacesIndexPage() {
  const data = await getAtlasData();
  const { places, polities, images } = data;
  const { getPolityById } = atlasAccess(data);
  const shaped = polities.flatMap((polity) => {
    const geometry = polityGeometry(polity.id, data);
    return geometry ? [{ polity, geometry }] : [];
  });
  const projected = projectTogether(shaped.map((s) => s.geometry), places.map((p) => p.coordinates), 100, 2);
  // Large empires go underneath and small kingdoms on top, so every kingdom stays a clean patch of its own colour.
  const extent = (d: string) => {
    const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0);
    const ys = n.filter((_, i) => i % 2 === 1);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  };
  const land = projected.paths
    .map((d, i) => ({ d, color: shaped[i].polity.accentColor, area: extent(d) }))
    .sort((a, b) => b.area - a.area)
    .map(({ d, color }) => ({ d, color }));

  const heldBy = (coordinates: [number, number]) =>
    [...new Set(boundariesContaining(coordinates, data).map((b) => b.polityId))]
      .map((id) => getPolityById(id)?.name)
      .filter((name): name is string => Boolean(name));

  const groups: PlaceGroup[] = AREA_ORDER.filter((area) => places.some((p) => broadArea(p.coordinates) === area))
    .map((area) => ({
      label: area,
      places: places
        .filter((p) => broadArea(p.coordinates) === area)
        .sort((a, b) => b.coordinates[1] - a.coordinates[1])
        .map((place) => {
          const held = heldBy(place.coordinates);
          return {
            id: place.id,
            row: (
              <Link
                key={place.id}
                href={`/places/${place.slug}`}
                transitionTypes={NAV_FORWARD}
                className="bh-lift group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border px-2 py-3"
              >
                <span className="font-display text-xl text-ink group-hover:text-territory-selected">{place.name}</span>
                <span className="font-sans text-sm text-ink-muted">{placeKindLabel(place.placeType)}</span>
                <span className="basis-full font-sans text-sm text-ink-muted">
                  {held.length === 0
                    ? "No mapped kingdom includes this place."
                    : `Held by ${held.length > 4 ? `${held.slice(0, 4).join(", ")} and ${held.length - 4} more` : held.join(", ")}`}
                </span>
              </Link>
            ),
          };
        }),
    }));

  return (
    <PageTransition>
            <PageHero
        title="Places"
        intro="Capitals, temples, forts and tombs, each set on the map and listed from north to south."
        field="#d8281a"
        media={
          <PortraitStack
            plates={["chola-brihadisvara", "vijayanagara-virupaksha", "place-khajuraho"].flatMap((k) =>
              images[k as ImageKey] ? [{ src: images[k as ImageKey].file, alt: images[k as ImageKey].alt }] : [],
            )}
          />
        }
      />
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div>
          <PlacesAtlas
            land={land}
            dots={places.map((p, i) => ({
              id: p.id,
              name: p.name,
              x: projected.points[i][0],
              y: projected.points[i][1],
              color: polities.find((k) => k.capitals.some((c) => p.name.startsWith(c)))?.accentColor ?? "var(--bh-ink)",
              href: `/places/${p.slug}`,
            }))}
            groups={groups}
          />
        </div>
      </div>
    </PageTransition>
  );
}
