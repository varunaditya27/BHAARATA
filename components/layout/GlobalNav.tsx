import Link from "next/link";
import { CommandPalette } from "@/components/search/CommandPalette";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

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
    <header
      className="relative z-40 h-16 border-b border-border bg-paper/90 backdrop-blur-sm"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0 font-display text-lg tracking-wide text-ink">
          BHĀRATA
        </Link>
        <NavLinks primary={primaryLinks} secondary={secondaryLinks} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <CommandPalette />
          <MobileMenu links={[...primaryLinks, ...secondaryLinks]} />
        </div>
      </div>
    </header>
  );
}
