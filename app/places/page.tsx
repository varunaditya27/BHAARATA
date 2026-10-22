import Link from "next/link";
import { PlacesAtlas, type PlaceGroup } from "@/components/entity/PlacesAtlas";
import { PageTransition } from "@/components/primitives/PageTransition";
import { getPolityBySlug, places, polities } from "@/lib/data/prototype";
import { placeKindLabel } from "@/lib/domain/labels";
import { AREA_ORDER, broadArea } from "@/lib/geo/areas";
import { boundariesContaining, polityGeometry, projectTogether } from "@/lib/geo/silhouette";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Places — BHĀRATA" };

export default function PlacesIndexPage() {
  const land = polities.map((p) => polityGeometry(p.id)).filter((g) => g !== undefined);
  const projected = projectTogether(land, places.map((p) => p.coordinates), 100, 2);

  const heldBy = (coordinates: [number, number]) =>
    [...new Set(boundariesContaining(coordinates).map((b) => b.polityId))]
      .map((id) => getPolityBySlug(id)?.name)
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
                className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border py-3"
              >
                <span className="font-display text-xl text-ink group-hover:text-territory-selected">{place.name}</span>
                <span className="font-sans text-sm text-ink-muted">{placeKindLabel(place.placeType)}</span>
                <span className="basis-full font-sans text-sm text-ink-muted">
                  {held.length === 0
                    ? "No kingdom in the atlas held it."
                    : `Held by ${held.length > 4 ? `${held.slice(0, 4).join(", ")} and ${held.length - 4} more` : held.join(", ")}`}
                </span>
              </Link>
            ),
          };
        }),
    }));

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl text-ink">Places</h1>
        <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">
          Capitals, ports, towns and monuments on the map, listed from north to south. Each page shows which kingdoms
          held the place, and when.
        </p>
        <p className="mt-3 max-w-prose font-sans text-sm text-ink-muted">
          Names and locations come from Wikidata, Wikipedia&rsquo;s open database. The areas are worked out from each
          place&rsquo;s location only, to help you find it; they are not historical regions. The shapes on the map are
          the kingdoms&rsquo; recorded borders, drawn over each other.
        </p>

        <div className="mt-12">
          <PlacesAtlas
            land={projected.paths}
            dots={places.map((p, i) => ({ id: p.id, name: p.name, x: projected.points[i][0], y: projected.points[i][1] }))}
            groups={groups}
          />
        </div>
      </div>
    </PageTransition>
  );
}
