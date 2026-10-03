import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { places } from "@/lib/data/prototype";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Places — BHĀRATA" };

export default function PlacesIndexPage() {
  return (
    <PageTransition>
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>Cities, ports and monuments</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Places</h1>
      <p className="mt-3 max-w-prose font-sans text-ink-muted">
        Capitals, ports and monuments that appear on the map. Each page shows which kingdoms held the place, and when.
      </p>
      <div className="mt-3">
        <Badge tone="uncertainty">Placeholder data, not yet checked</Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {places.map((place) => (
          <Link key={place.id} href={`/places/${place.slug}`} transitionTypes={NAV_FORWARD} className="group block border-t border-border pt-4">
            <h2 className="font-display text-xl text-ink group-hover:text-territory-selected">{place.name}</h2>
            <p className="font-sans text-sm text-ink-muted"><span className="capitalize">{place.placeType}</span> · {place.region}</p>
          </Link>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}
