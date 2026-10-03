import Link from "next/link";
import { CommandPalette } from "@/components/search/CommandPalette";

const primaryLinks = [
  { href: "/atlas", label: "Atlas" },
  { href: "/chronology", label: "Chronology" },
  { href: "/polities", label: "Kingdoms" },
  { href: "/people", label: "People" },
  { href: "/places", label: "Places" },
  { href: "/evidence", label: "Evidence" },
];

const secondaryLinks = [{ href: "/method", label: "Method" }];

export function GlobalNav() {
  return (
    <header className="border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 font-display text-lg tracking-wide text-ink">
          BHĀRATA
        </Link>
        <nav className="flex items-center gap-5 font-sans text-sm text-ink-muted">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-border" aria-hidden />
          {secondaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto shrink-0">
          <CommandPalette />
        </div>
      </div>
    </header>
  );
}
