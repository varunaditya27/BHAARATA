import Link from "next/link";
import { HideOnRoutes } from "./HideOnRoutes";

const LINKS = [
  { href: "/atlas", label: "Atlas" },
  { href: "/chronology", label: "Chronology" },
  { href: "/polities", label: "Kingdoms" },
  { href: "/people", label: "People" },
  { href: "/places", label: "Places" },
  { href: "/evidence", label: "Evidence" },
  { href: "/method", label: "Method" },
];

/**
 * The closing page of every page, set like a book's colophon: what this
 * is, how it was made, and who made the things it borrows. Not shown on
 * the Atlas, which fills the screen.
 */
export function Colophon() {
  return (
    <HideOnRoutes routes={["/atlas"]}>
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-[0.04em] text-ink">BHĀRATA</p>
            <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-ink-muted">
              An atlas of the Indian subcontinent through time: which kingdoms held which land, when, and how we know.
              Kingdom borders come from the Cliopatria dataset and summaries from Wikipedia. Rulers, events and evidence are still placeholders.
            </p>
          </div>
          <nav aria-label="Footer" className="font-sans text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Pages</p>
            <ul className="mt-3 grid grid-cols-2 gap-y-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="font-sans text-sm text-ink-muted">
            <p className="text-xs uppercase tracking-[0.16em]">Made with</p>
            <p className="mt-3 leading-relaxed">
              Fonts: Zodiak and Ranade, with Anek and Tiro for Indian scripts. Photographs from Wikimedia Commons; map
              data from OpenStreetMap contributors and CARTO.
            </p>
            <Link href="/method#credits" className="mt-2 inline-block text-ink underline underline-offset-4">
              Full credits
            </Link>
          </div>
        </div>
      </footer>
    </HideOnRoutes>
  );
}
