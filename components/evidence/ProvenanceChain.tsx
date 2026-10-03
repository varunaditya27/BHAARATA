import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import type { ImageCredit } from "@/lib/data/images";
import type { Evidence, Place, Source } from "@/lib/domain/types";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

type Status = "real" | "partly" | "placeholder";
type Link_ = { step: string; what: React.ReactNode; status: Status; note: string };

const STATUS_LABEL: Record<Status, string> = { real: "Real", partly: "Partly real", placeholder: "Placeholder" };

/**
 * How we know: every link from the physical object to the published
 * source, in order, each marked honestly as real, partly real or
 * placeholder. A claim is only as good as the weakest link in this chain,
 * so the chain is shown whole rather than summarised.
 */
export function ProvenanceChain({
  record,
  image,
  place,
  sources,
}: {
  record: Evidence;
  image?: ImageCredit;
  place?: Place;
  sources: Source[];
}) {
  const links: Link_[] = [
    {
      step: "The object",
      what: (
        <>
          {record.material ?? record.evidenceType}
          {place && (
            <>
              {" "}
              at{" "}
              <Link href={`/places/${place.slug}`} transitionTypes={NAV_FORWARD} className="underline underline-offset-4">
                {place.name}
              </Link>
            </>
          )}
          {record.catalogueId && <span className="text-ink-muted"> · catalogue {record.catalogueId}</span>}
        </>
      ),
      status: record.catalogueId?.startsWith("EXAMPLE") ? "placeholder" : "real",
      note: record.catalogueId?.startsWith("EXAMPLE")
        ? "A made-up catalogue number standing in for a real inscription."
        : "A catalogued object.",
    },
  ];
  if (image) {
    links.push({
      step: "The photograph",
      what: (
        <>
          {image.title} —{" "}
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {image.artist}, {image.license}
          </a>
        </>
      ),
      status: record.imageIsIllustrative ? "partly" : "real",
      note: record.imageIsIllustrative
        ? "A real, credited photograph — but of a different inscription, shown to illustrate the kind of object."
        : "A photograph of this object.",
    });
  }
  if (record.transcription.length === 0 && record.translation.length > 0) {
    links.push({
      step: "The original text",
      what: `${record.script ?? "Original"}, printed in the volume`,
      status: "partly",
      note: "Not typed out here. The machine-read scan garbles the Tamil, and we won't guess at it. Read it in the scan linked below.",
    });
  }
  if (record.transcription.length > 0) {
    links.push({
      step: "The transcription",
      what: `${record.transcription.length} lines in ${record.script ?? "the original script"}`,
      status: record.textIsIllustrative ? "placeholder" : "real",
      note: record.textIsIllustrative
        ? "Placeholder lines written to show the layout, not read from the stone."
        : "Read from the object.",
    });
  }
  if (record.translation.length > 0) {
    links.push({
      step: "The translation",
      what: `${record.translation.length} lines in English`,
      status: record.textIsIllustrative ? "placeholder" : "real",
      note: record.textIsIllustrative ? "Placeholder lines matching the placeholder transcription." : "Translated into English by the volume's editors. Shown here in part.",
    });
  }
  links.push({
    step: "The claim",
    what: record.claim,
    status: record.claimIsIllustrative ? "placeholder" : "real",
    note: record.claimIsIllustrative ? "A worked example of how a claim links to its evidence." : "What this evidence is taken to show.",
  });
  for (const s of sources) {
    links.push({
      step: "The source",
      what: (
        <>
          {s.title}
          <span className="block text-xs text-ink-muted">{s.citation}</span>
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs underline underline-offset-4">
              Open the scan
            </a>
          )}
        </>
      ),
      status: record.textIsIllustrative ? "partly" : "real",
      note: record.textIsIllustrative
        ? "A real published series — but this page doesn't yet quote a specific inscription from it."
        : "Where the reading is published.",
    });
  }

  return (
    <section className="mt-14">
      <Eyebrow>How we know</Eyebrow>
      <p className="mt-1 max-w-prose font-sans text-sm text-ink-muted">
        Each step from the stone to the claim, in order. A claim is only as strong as its weakest step.
      </p>
      <ol className="relative mt-6 border-l border-border pl-8">
        {links.map((l, i) => (
          <li key={i} className="bh-reveal relative pb-7 last:pb-0">
            <span
              className={`absolute -left-[37px] top-1 flex h-[11px] w-[11px] rotate-45 border-2 ${
                l.status === "real" ? "border-ink bg-ink" : l.status === "partly" ? "border-ink bg-paper" : "border-uncertainty bg-paper"
              }`}
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                {i + 1}. {l.step}
              </p>
              <Badge tone={l.status === "real" ? "neutral" : "uncertainty"}>{STATUS_LABEL[l.status]}</Badge>
            </div>
            <div className="mt-1 font-sans text-ink">{l.what}</div>
            <p className="mt-0.5 font-sans text-sm text-ink-muted">{l.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
