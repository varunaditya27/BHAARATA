import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { places } from "@/lib/data/prototype";

export const metadata = { title: "Places — BHĀRATA" };

export default function PlacesIndexPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>Spatial exploration</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Places</h1>
      <div className="mt-3">
        <Badge tone="uncertainty">Illustrative prototype data</Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {places.map((place) => (
          <Link key={place.id} href={`/places/${place.slug}`} className="group block border-t border-border pt-4">
            <h2 className="font-display text-xl text-ink group-hover:text-territory-selected">{place.name}</h2>
            <p className="font-sans text-sm text-ink-muted">{place.placeType} · {place.region}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
