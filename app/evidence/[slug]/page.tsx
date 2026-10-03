import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";
import { ClaimThread } from "@/components/evidence/ClaimThread";
import { EvidenceInvestigation } from "@/components/evidence/EvidenceInvestigation";
import { evidence, getPlaceById, getSourceById } from "@/lib/data/prototype";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";

export function generateStaticParams() {
  return evidence.map((e) => ({ slug: e.slug }));
}

export default async function EvidencePage({ params }: PageProps<"/evidence/[slug]">) {
  const { slug } = await params;
  const record = evidence.find((e) => e.slug === slug);
  if (!record) notFound();

  const image = record.imageKey ? images[record.imageKey as ImageKey] : undefined;
  const place = record.placeId ? getPlaceById(record.placeId) : undefined;
  const sourceRecords = record.sourceIds
    .map((id) => getSourceById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <Eyebrow>Evidence · {record.evidenceType}</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">{record.title}</h1>
      <p className="mt-2 font-sans text-ink-muted">{formatDateRange(record.period)}</p>

      <div className="mt-4 grid gap-10 md:grid-cols-[2fr_1fr]">
        <div>
          {image ? (
            <EvidenceInvestigation record={record} image={image} />
          ) : (
            <p className="font-sans text-sm text-ink-muted">No image on file for this record.</p>
          )}
          {record.imageIsIllustrative && (
            <p className="mt-2 font-sans text-xs text-ink-muted">
              This photograph is real and correctly credited, but it is not a photograph of the
              specific record described on this page — see{" "}
              <Link href="/method" className="underline underline-offset-4 hover:text-ink">
                Method
              </Link>
              .
            </p>
          )}
        </div>

        <div className="space-y-6 font-sans text-sm">
          {record.material && (
            <div><Eyebrow>Material</Eyebrow><p className="mt-1 text-ink">{record.material}</p></div>
          )}
          {record.script && (
            <div><Eyebrow>Script</Eyebrow><p className="mt-1 text-ink">{record.script}</p></div>
          )}
          {record.language && (
            <div><Eyebrow>Language</Eyebrow><p className="mt-1 text-ink">{record.language}</p></div>
          )}
          {place && (
            <div>
              <Eyebrow>Location</Eyebrow>
              <p className="mt-1 text-ink">
                <Link href={`/places/${place.slug}`} className="underline underline-offset-4 hover:text-territory-selected">
                  {place.name}
                </Link>
              </p>
            </div>
          )}
          {record.catalogueId && (
            <div><Eyebrow>Catalogue ID</Eyebrow><p className="mt-1 text-ink">{record.catalogueId}</p></div>
          )}
          {record.condition && (
            <div><Eyebrow>Condition</Eyebrow><p className="mt-1 text-ink">{record.condition}</p></div>
          )}
        </div>
      </div>

      <Rule className="mt-12" />

      <div className="mt-10">
        <Badge tone="uncertainty">Illustrative claim/evidence example</Badge>
        <ClaimThread record={record} />
      </div>

      {sourceRecords.length > 0 && (
        <div className="mt-12 border-t border-border pt-6">
          <Eyebrow>Sources</Eyebrow>
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
  );
}
