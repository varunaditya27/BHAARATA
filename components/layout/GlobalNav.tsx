import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { CommandPalette } from "@/components/search/CommandPalette";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

const primaryLinks = [
  { href: "/atlas", label: "Atlas" },
  { href: "/chronology", label: "Timeline" },
  { href: "/polities", label: "Kingdoms" },
  { href: "/people", label: "People" },
  { href: "/places", label: "Places" },
  { href: "/evidence", label: "Evidence" },
];

const secondaryLinks = [{ href: "/data", label: "Browse data" }, { href: "/connections", label: "ER diagram" }];

export function GlobalNav() {
  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-border bg-paper"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-lg tracking-wide text-ink"
        >
          <BrandMark size={22} className="text-ink" />
          <span>BHĀRATA</span>
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
