import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { HideOnRoutes } from "./HideOnRoutes";

const LINKS = [
  { href: "/atlas", label: "Atlas" },
  { href: "/chronology", label: "Timeline" },
  { href: "/polities", label: "Kingdoms" },
  { href: "/people", label: "People" },
  { href: "/places", label: "Places" },
  { href: "/evidence", label: "Evidence" },
  { href: "/data", label: "Browse data" },
  { href: "/connections", label: "ER diagram" },
];

/**
 * Minimal editorial colophon shown at the bottom of reading pages.
 * Hidden on the full-screen /atlas route.
 */
export function Colophon() {
  return (
    <HideOnRoutes routes={["/atlas"]}>
      <footer className="border-t border-border bg-paper">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size={22} className="shrink-0 text-ink" />
              <div>
                <p className="font-display text-lg tracking-[0.05em] text-ink">
                  BHĀRATA
                </p>
                <p className="font-sans text-xs text-ink-muted">
                  An atlas of the Indian subcontinent, 600–1700 CE.
                </p>
              </div>
            </div>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-xs">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </HideOnRoutes>
  );
}
