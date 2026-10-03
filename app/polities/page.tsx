import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/primitives/Badge";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Shared } from "@/components/primitives/Shared";
import { polities } from "@/lib/data/prototype";
import { images, type ImageKey } from "@/lib/data/images";
import { formatDateRange } from "@/lib/domain/time";
import { NAV_FORWARD, transitionNames } from "@/lib/utils/view-transition";

export const metadata = {
  title: "Kingdoms — BHĀRATA",
};

export default function PolitiesIndexPage() {
  return (
    <PageTransition>
    <div className="mx-auto max-w-[1000px] px-6 py-16">
      <Eyebrow>Semantic exploration</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Kingdoms</h1>
      <p className="mt-3 max-w-prose font-sans text-ink-muted">
        Dynasties, empires, and regional states — what the underlying data
        model calls a &ldquo;polity,&rdquo; named plainly here.
      </p>
      <div className="mt-3">
        <Badge tone="uncertainty">Illustrative prototype data</Badge>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {polities.map((polity) => {
          const hero = polity.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
          return (
            <Link key={polity.id} href={`/polities/${polity.slug}`} transitionTypes={NAV_FORWARD} className="group block">
              {hero && (
                <Shared name={transitionNames.polityPhoto(polity.slug)}>
                <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                  <Image
                    src={hero.file}
                    alt={hero.alt}
                    fill
                    sizes="(min-width: 640px) 480px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                </Shared>
              )}
              <h2 className="mt-3 font-display text-2xl text-ink group-hover:text-territory-selected">
                {polity.name}
              </h2>
              <p className="mt-1 font-sans text-sm text-ink-muted">
                {formatDateRange(polity.period)} · {polity.region}
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                {polity.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
    </PageTransition>
  );
}
