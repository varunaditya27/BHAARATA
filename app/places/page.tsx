import Link from "next/link";
import { PlacesAtlas, type PlaceGroup } from "@/components/entity/PlacesAtlas";
import { PageHero } from "@/components/primitives/PageHero";
import { HERO } from "@/lib/hero";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { placeKindLabel } from "@/lib/domain/labels";
import { AREA_ORDER, broadArea } from "@/lib/geo/areas";
import { boundariesContaining } from "@/lib/geo/silhouette";

export const metadata = { title: "Places — BHĀRATA" };

export default async function PlacesIndexPage() {
  const data = await getAtlasData();
  const { places, polities } = data;
  const { getPolityById } = atlasAccess(data);
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
    <>
            <PageHero
        title="Places"
        intro="Capitals, temples, forts and tombs, each set on the map and listed from north to south."
        hero={HERO.places}
      />
      <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6">
        <div>
          <PlacesAtlas
            places={places.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              coordinates: p.coordinates,
              color: polities.find((k) => k.capitals.some((c) => p.name.startsWith(c)))?.accentColor ?? "#06242b",
              heldBy: [...new Set(boundariesContaining(p.coordinates, data).map((b) => b.polityId))],
            }))}
            groups={groups}
          />
        </div>
      </div>
    </>
  );
}
