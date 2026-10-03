"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildSearchIndex, searchEntryGroupLabel, type SearchEntryType } from "@/lib/search";

const GROUP_ORDER: SearchEntryType[] = ["kingdom", "person", "place", "event", "evidence"];

/**
 * ⌘K / Ctrl+K from anywhere in the app. One flat index built from the
 * same prototype data every page already reads — see lib/search/index.ts.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const entries = useMemo(() => buildSearchIndex(), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const grouped = useMemo(() => {
    const byType = new Map<SearchEntryType, typeof entries>();
    for (const type of GROUP_ORDER) byType.set(type, []);
    for (const entry of entries) byType.get(entry.type)?.push(entry);
    return byType;
  }, [entries]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-border px-3 py-1.5 font-sans text-sm text-ink-muted hover:border-ink hover:text-ink"
      >
        Search
        <kbd className="rounded-sm border border-border bg-paper-raised px-1.5 py-0.5 font-sans text-[0.65rem] text-ink-muted">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        label="Search BHĀRATA"
        overlayClassName="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
        contentClassName="fixed left-1/2 top-[18vh] z-50 w-full max-w-lg -translate-x-1/2 border border-border bg-paper-raised shadow-xl"
      >
        <CommandInput
          placeholder="Search kingdoms, people, places, events, evidence…"
          className="w-full border-b border-border bg-transparent px-4 py-3 font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <CommandList className="max-h-[60vh] overflow-y-auto p-2">
          <CommandEmpty className="px-3 py-6 text-center font-sans text-sm text-ink-muted">
            Nothing matches that.
          </CommandEmpty>
          {GROUP_ORDER.map((type) => {
            const items = grouped.get(type);
            if (!items || items.length === 0) return null;
            return (
              <CommandGroup
                key={type}
                heading={searchEntryGroupLabel(type)}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:text-[0.65rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-ink-muted"
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => go(item.href)}
                    className="cursor-pointer px-3 py-2 font-sans text-sm text-ink data-[selected=true]:bg-stone/60"
                  >
                    <span className="block">{item.title}</span>
                    <span className="block text-xs text-ink-muted">{item.subtitle}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
