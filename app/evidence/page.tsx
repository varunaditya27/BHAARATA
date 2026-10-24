import Image from "next/image";
import Link from "next/link";
import { PageTransition } from "@/components/primitives/PageTransition";
import { images, type ImageKey } from "@/lib/data/images";
import { evidence, getPlaceById } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Evidence — BHĀRATA" };

const expandCatalogue = (id: string) => id.replace(/^SII /, "South Indian Inscriptions, ");

export default function EvidenceIndexPage() {
  // Records often share one stand-in photograph; show each distinct photo once.
  const photoKeys = [...new Set(evidence.map((e) => e.imageKey).filter((k): k is string => Boolean(k)))];
  const photo = photoKeys.length === 1 ? images[photoKeys[0] as ImageKey] : undefined;
  const illustrative = evidence.every((e) => e.imageIsIllustrative);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl text-ink">Evidence</h1>
        <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">
          Evidence is the real object a claim rests on: words cut in stone, a coin, a building. Each page follows one
          object from the stone itself to the book where its reading was published.
        </p>

        <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          {photo && (
            <figure className="md:sticky md:top-24 md:self-start">
              <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                <Image src={photo.file} alt={photo.alt} fill loading="eager" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
              </div>
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
              There are {evidence.length} records so far. Each is read from a published English translation, and each
              page says what is still missing. More will be added only once they are checked.
            </p>
            <ul className="mt-8">
              {evidence.map((ev) => {
                const place = ev.placeId ? getPlaceById(ev.placeId) : undefined;
                return (
                  <li key={ev.id}>
                    <Link href={`/evidence/${ev.slug}`} transitionTypes={NAV_FORWARD} className="group block border-t border-ink/70 py-6">
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
