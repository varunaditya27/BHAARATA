import { PageTransition } from "@/components/primitives/PageTransition";
import { Rule } from "@/components/primitives/Rule";
import { images } from "@/lib/data/images";

export const metadata = {
  title: "How it works — BHĀRATA",
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
        <h1 className="font-display text-5xl text-ink">How this atlas works</h1>

        <Rule className="mt-8" />

        <section className="mt-8 space-y-4 font-sans text-lg leading-relaxed text-ink">
          <p className="bh-dropcap">
            This is a working version. The kingdoms, their dates and their borders come from{" "}
            <strong>Cliopatria</strong>, an open research dataset built by historians and data scientists. The
            descriptions, ruler lists, battles and places come from <strong>Wikipedia</strong> and{" "}
            <strong>Wikidata</strong>; a few texts written here were checked, statement by statement, against the
            Wikipedia article named on the page. Two things are <strong>not researched</strong> and should not be
            quoted as fact: the outline of the Chera kingdom, and the two example routes on the map, which are drawn
            by hand. Each page says where its data comes from.
          </p>
          <p>
            Even the researched borders are one version of the past. Real frontiers moved, overlapped, and were often
            never fixed lines at all, and historians disagree about many of them. The map shows each kingdom at the
            moment its record was drawn, and moves to the next record when that one ends.
          </p>
          <p>
            The aim is for every record to name the source it comes from, so you can follow any claim back to the
            inscription, coin, text or study behind it. Where a record can&rsquo;t do that yet, it is labelled.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl text-ink">Reading a date</h2>
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
          <h2 className="font-display text-3xl text-ink">Reading the map</h2>
          <ul className="mt-4 space-y-3 font-sans text-ink-muted">
            <li>
              <span className="text-ink">Shaded area</span>: the territory a kingdom held in that year, as far as the
              outline shows it.
            </li>
            <li>
              <span className="text-ink">Hatched edge</span>: the frontier&rsquo;s exact line isn&rsquo;t known; it
              lay somewhere in that band.
            </li>
            <li>
              <span className="text-ink">Dashed outline</span>: land a kingdom lost in the last 60 years. It fades as
              the years pass.
            </li>
            <li>
              <span className="text-ink">Red dot with a name</span>: a battle. It appears in the year it was fought and
              stays for ten years. Click it for a short description. Wikidata rarely records who fought, so each battle
              is linked to the kingdoms whose borders contained the site that year, which is not always the combatants.
            </li>
            <li>
              <span className="text-ink">Dark dots (off by default)</span>: monuments the Archaeological Survey of
              India protects today. The data has no construction dates for them, so they are not tied to a year.
            </li>
            <li>
              <span className="text-ink">Modern borders and country names</span> are left off on purpose, so the map
              doesn&rsquo;t suggest today&rsquo;s lines existed then.
            </li>
          </ul>
        </section>

        <section id="credits" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-3xl text-ink">Credits</h2>

          <h3 className="mt-6 font-display text-xl text-ink">Photographs</h3>
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

          <h3 className="mt-10 font-display text-xl text-ink">Maps</h3>
          <ul className="mt-3 space-y-2 font-sans text-sm text-ink-muted">
            <li>Base map © CARTO, map data © OpenStreetMap contributors.</li>
            <li>Terrain from Terrain Tiles (Mapzen, AWS Open Data).</li>
            <li>
              Kingdom borders and dates: Cliopatria, Seshat Global History Databank (CC BY 4.0). Data simplified for
              the web.
            </li>
            <li>Kingdom summaries: the opening paragraphs of the Wikipedia articles linked on each kingdom page (CC BY-SA 4.0).</li>
            <li>
              Capital cities, rulers and their dates, battle dates and sites, and monument locations: Wikidata (CC0).
              Ruler and battle summaries: the Wikipedia articles named on each page.
            </li>
            <li>
              The Chera outline is a placeholder built from modern Kerala districts (indian-district-boundaries project
              on GitHub, MIT licence).
            </li>
          </ul>

          <h3 className="mt-10 font-display text-xl text-ink">Type</h3>
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
