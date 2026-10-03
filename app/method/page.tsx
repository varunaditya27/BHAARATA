import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { images } from "@/lib/data/images";

export const metadata = {
  title: "Method — BHĀRATA",
};

const DATE_KEY = [
  ["c. 985", "Around 985 — the record gives an approximate year."],
  ["before 1100", "Some time before 1100; how long before isn't known."],
  ["after 1336", "Some time after 1336."],
  ["date unknown", "The record doesn't let us date it. It is shown as unknown, never guessed."],
  ["(disputed)", "Historians disagree about this date; the one shown is a common reading, not a settled one."],
] as const;

export default function MethodPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
        <Eyebrow>How to read this atlas</Eyebrow>
        <h1 className="mt-2 font-display text-5xl text-ink">Method</h1>

        <Rule className="mt-8" />

        <section className="mt-8 space-y-4 font-sans text-lg leading-relaxed text-ink">
          <p className="bh-dropcap">
            This is an early working version. The kingdoms, rulers, places, dates and outlines you see are{" "}
            <strong>placeholders</strong>, written by hand so the map and timeline have something to show. They follow
            the broad shape of the history, but they have not been checked against scholarship, and none of it should
            be quoted as fact.
          </p>
          <p>
            The kingdom outlines in particular are rough. They were built by grouping modern districts into an
            approximate core territory — real frontiers moved, overlapped, and were often never fixed lines at all.
          </p>
          <p>
            When real records replace these, every one will name the source it comes from, so you can follow any claim
            back to the inscription, coin, text or study behind it.
          </p>
        </section>

        <section className="mt-14">
          <Eyebrow>Reading a date</Eyebrow>
          <dl className="mt-4 divide-y divide-border border-y border-border font-sans">
            {DATE_KEY.map(([term, meaning]) => (
              <div key={term} className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
                <dt className="font-display text-lg text-ink">{term}</dt>
                <dd className="text-ink-muted">{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <Eyebrow>Reading the map</Eyebrow>
          <ul className="mt-4 space-y-3 font-sans text-ink-muted">
            <li>
              <span className="text-ink">Shaded area</span> — the territory a kingdom held in that year, as far as the
              outline shows it.
            </li>
            <li>
              <span className="text-ink">Hatched edge</span> — the frontier&rsquo;s exact line isn&rsquo;t known; it
              lay somewhere in that band.
            </li>
            <li>
              <span className="text-ink">Modern borders and country names</span> are left off on purpose, so the map
              doesn&rsquo;t suggest today&rsquo;s lines existed then.
            </li>
          </ul>
        </section>

        <section id="credits" className="mt-14 scroll-mt-24">
          <Eyebrow>Credits</Eyebrow>

          <h2 className="mt-6 font-display text-2xl text-ink">Photographs</h2>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            All from Wikimedia Commons, used under the licence each photographer chose.
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm">
            {Object.values(images).map((img) => (
              <li key={img.file} className="flex flex-wrap gap-x-2 border-t border-border pt-2">
                <span className="text-ink">{img.title}</span>
                <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink-muted underline underline-offset-2 hover:text-ink">
                  {img.artist}, {img.license}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl text-ink">Maps</h2>
          <ul className="mt-3 space-y-2 font-sans text-sm text-ink-muted">
            <li>Base map © CARTO, map data © OpenStreetMap contributors.</li>
            <li>Terrain from Terrain Tiles (Mapzen, AWS Open Data).</li>
            <li>Kingdom outlines assembled from district boundaries published in the indian-district-boundaries project on GitHub.</li>
          </ul>

          <h2 className="mt-10 font-display text-2xl text-ink">Type</h2>
          <ul className="mt-3 space-y-2 font-sans text-sm text-ink-muted">
            <li>Zodiak and Ranade by the Indian Type Foundry, from Fontshare.</li>
            <li>Anek Tamil, Kannada, Telugu and Devanagari by Ek Type.</li>
            <li>Tiro Tamil, Kannada, Telugu and Devanagari Hindi by Tiro Typeworks.</li>
          </ul>
        </section>
      </div>
    </PageTransition>
  );
}
