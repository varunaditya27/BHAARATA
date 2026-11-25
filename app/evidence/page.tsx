import Image from "next/image";
import Link from "next/link";
import { Tilt } from "@/components/primitives/Tilt";
import { PageHero } from "@/components/primitives/PageHero";
import { PageTransition } from "@/components/primitives/PageTransition";
import type { ImageKey } from "@/lib/domain/types";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { formatDateRange } from "@/lib/domain/time";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Evidence — BHĀRATA" };

const expandCatalogue = (id: string) => id.replace(/^SII /, "South Indian Inscriptions, ");

export default async function EvidenceIndexPage() {
  const data = await getAtlasData();
  const { images, evidence } = data;
  const { getPlaceById } = atlasAccess(data);
  // Records often share one stand-in photograph; show each distinct photo once.
  const photoKeys = [...new Set(evidence.map((e) => e.imageKey).filter((k): k is string => Boolean(k)))];
  const photo = photoKeys.length === 1 ? images[photoKeys[0] as ImageKey] : undefined;
  const illustrative = evidence.every((e) => e.imageIsIllustrative);

  return (
    <PageTransition>
            <PageHero
        title="Evidence"
        intro="Words carved in stone, and the books that translated them. Every claim can be followed back to its source."
        field="#2347d6"
        tall={false}
      />
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          {photo && (
            <figure className="md:sticky md:top-24 md:self-start">
              <Tilt className="shadow-[0_30px_60px_-28px_rgba(26,18,64,0.55)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                  <Image src={photo.file} alt={photo.alt} fill loading="eager" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                </div>
              </Tilt>
              <figcaption className="mt-3 font-sans text-sm text-ink-muted">
                {illustrative && "This photograph shows a similar stone inscription, not the ones listed here. "}
                {photo.title}.{" "}
                <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {photo.artist}, {photo.license}
                </a>
              </figcaption>
            </figure>
          )}

          <div>
            <p className="max-w-prose font-sans text-ink">
              There are {evidence.length} records so far. Each is read from a published English translation.
            </p>
            <ul className="mt-8">
              {evidence.map((ev) => {
                const place = ev.placeId ? getPlaceById(ev.placeId) : undefined;
                return (
                  <li key={ev.id} className="bh-reveal">
                    <Link href={`/evidence/${ev.slug}`} transitionTypes={NAV_FORWARD} className="bh-lift group block border-t border-ink/70 px-3 py-6">
                      <p className="font-sans text-sm text-ink-muted">
                        {ev.evidenceType.charAt(0).toUpperCase() + ev.evidenceType.slice(1)}
                        {place && ` at ${place.name}`}, {formatDateRange(ev.period)}
                      </p>
                      <h2 className="mt-2 font-display text-3xl leading-tight text-ink group-hover:text-territory-selected">{ev.title}</h2>
                      {ev.material && <p className="mt-3 font-sans text-sm text-ink-muted">{ev.material}</p>}
                      {ev.catalogueId && (
                        <p className="font-sans text-sm text-ink-muted">Published in {expandCatalogue(ev.catalogueId)}</p>
                      )}
                      <span className="mt-4 inline-block font-sans text-sm text-ink underline underline-offset-4">See what it says and how we know</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
