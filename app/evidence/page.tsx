import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { evidence } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { PageTransition } from "@/components/primitives/PageTransition";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

export const metadata = { title: "Evidence — BHĀRATA" };

export default function EvidenceIndexPage() {
  return (
    <PageTransition>
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>How we know</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Evidence</h1>
      <p className="mt-4 max-w-prose font-sans text-ink-muted">
        The inscriptions, coins, monuments and texts that claims rest on — each one traced step by step from the
        object itself to where its reading is published.
      </p>
      <div className="mt-3">
        <Badge tone="neutral">One real inscription translation · one placeholder example</Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {evidence.map((ev) => (
          <Link key={ev.id} href={`/evidence/${ev.slug}`} transitionTypes={NAV_FORWARD} className="group block border-t border-border pt-4">
            <p className="font-sans text-xs uppercase tracking-wide text-ink-muted">{ev.evidenceType}</p>
            <h2 className="mt-1 font-display text-xl text-ink group-hover:text-territory-selected">
              {ev.title}
            </h2>
            <p className="font-sans text-sm text-ink-muted">{formatDateRange(ev.period)}</p>
          </Link>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}
