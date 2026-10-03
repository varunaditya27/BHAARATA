import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";
import { ClaimThread } from "@/components/evidence/ClaimThread";
import { EvidenceInvestigation } from "@/components/evidence/EvidenceInvestigation";
import { ProvenanceChain } from "@/components/evidence/ProvenanceChain";
import { evidence, getPlaceById, getSourceById } from "@/lib/data/prototype";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

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
    <PageTransition>
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
                <Link href={`/places/${place.slug}`} transitionTypes={NAV_FORWARD} className="underline underline-offset-4 hover:text-territory-selected">
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
        <Badge tone={record.claimIsIllustrative ? "uncertainty" : "neutral"}>{record.claimIsIllustrative ? "Worked example, not a real reading" : "Translation from a published edition"}</Badge>
        <ClaimThread record={record} />
      </div>

      <ProvenanceChain record={record} image={image} place={place} sources={sourceRecords} />
    </div>
    </PageTransition>
  );
}
