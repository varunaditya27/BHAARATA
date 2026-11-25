import { AudioControls } from "@/components/audio/AudioControls";
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

const secondaryLinks = [
  { href: "/search", label: "Filter" },
  { href: "/data", label: "Browse data" },
  { href: "/connections", label: "ER diagram" },
];

export function GlobalNav() {
  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-border bg-paper"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-3.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg tracking-[0.06em] text-ink transition-opacity hover:opacity-80"
          >
            <BrandMark size={22} className="text-ink" />
            <span>BHĀRATA</span>
          </Link>
          <span
            className="hidden h-4 w-px bg-border 2xl:inline-block"
            aria-hidden
          />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft 2xl:inline">
            600–1700 CE
          </span>
        </div>

        <NavLinks primary={primaryLinks} secondary={secondaryLinks} />

        <div className="flex shrink-0 items-center gap-2">
          <AudioControls />
          <CommandPalette />
          <MobileMenu links={[...primaryLinks, ...secondaryLinks]} />
        </div>
      </div>
    </header>
  );
}
