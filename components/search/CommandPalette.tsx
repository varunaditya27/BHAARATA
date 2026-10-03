"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";
import { buildSearchIndex, searchEntryGroupLabel, yearCommand, type SearchEntry, type SearchEntryType } from "@/lib/search";

const GROUP_ORDER: SearchEntryType[] = ["kingdom", "person", "place", "event", "evidence"];
const RECENT_KEY = "bh-recent";
const RECENT_MAX = 5;

const GROUP_CLASS =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:text-[0.65rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-ink-muted";
const ITEM_CLASS =
  "flex cursor-pointer items-center gap-3 px-3 py-2 font-sans text-sm text-ink data-[selected=true]:bg-stone/60";

/** Recently opened results, per browser. Storage can be unavailable
 * (private windows, blocked site data), so every access is guarded. */
function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((h): h is string => typeof h === "string") : [];
  } catch {
    return [];
  }
}
function rememberRecent(href: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...readRecent().filter((h) => h !== href)].slice(0, RECENT_MAX)));
  } catch {
    // Not remembering is fine.
  }
}

function ResultRow({ item }: { item: SearchEntry }) {
  return (
    <>
      {item.emblem && <KingdomEmblem polityId={item.emblem.polityId} color={item.emblem.color} className="h-7 w-7 shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="block">{item.title}</span>
        <span className="block truncate text-xs text-ink-muted">{item.subtitle}</span>
      </span>
      {item.dates && (
        <span className="hidden w-40 shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-ink-muted sm:block">{item.dates}</span>
      )}
    </>
  );
}

/**
 * ⌘K / Ctrl+K from anywhere in the app. One flat index built from the
 * same prototype data every page already reads — see lib/search/index.ts.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const entries = useMemo(() => buildSearchIndex(), []);
  const byHref = useMemo(() => new Map(entries.map((e) => [e.href, e])), [entries]);
  const jump = yearCommand(query);

  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Opening reads the recent list fresh (it changes as you navigate).
  const setOpen = useCallback((next: boolean) => {
    if (next && !openRef.current) {
      setRecent(readRecent());
      setQuery("");
    }
    openRef.current = next;
    setOpenState(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!openRef.current);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  const grouped = useMemo(() => {
    const byType = new Map<SearchEntryType, typeof entries>();
    for (const type of GROUP_ORDER) byType.set(type, []);
    for (const entry of entries) byType.get(entry.type)?.push(entry);
    return byType;
  }, [entries]);

  const go = (href: string, remember = true) => {
    if (remember) rememberRecent(href);
    setOpen(false);
    router.push(href);
  };
  const recentEntries = recent.map((h) => byHref.get(h)).filter((e): e is SearchEntry => Boolean(e));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex h-9 items-center gap-2 border border-border px-2.5 font-sans text-sm text-ink-muted hover:border-ink hover:text-ink sm:px-3"
      >
        <Search size={15} className="sm:hidden" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded-sm border border-border bg-paper-raised px-1.5 py-0.5 font-sans text-[0.65rem] text-ink-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        label="Search BHĀRATA"
        overlayClassName="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
        contentClassName="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-border bg-paper-raised shadow-xl sm:top-[18vh]"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search kingdoms, people, places — or type a year"
          className="w-full border-b border-border bg-transparent px-4 py-3 font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <CommandList className="max-h-[60vh] overflow-y-auto p-2">
          {!jump && (
            <CommandEmpty className="px-3 py-6 text-center font-sans text-sm text-ink-muted">
              No results.
            </CommandEmpty>
          )}
          {jump && (
            <CommandGroup heading="Go to" forceMount className={GROUP_CLASS}>
              {jump.inRange ? (
                <CommandItem
                  forceMount
                  value={`year ${jump.year}`}
                  onSelect={() => go(`/atlas?year=${jump.year}`, false)}
                  className={ITEM_CLASS}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-border font-display text-[0.6rem]">
                    {jump.year}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">See the map in {jump.year} CE</span>
                    <span className="block truncate text-xs text-ink-muted">
                      {jump.kingdoms.length ? jump.kingdoms.join(", ") : "No recorded kingdom on the map that year"}
                    </span>
                  </span>
                </CommandItem>
              ) : (
                <p className="px-3 py-2 font-sans text-xs text-ink-muted">The atlas covers 600 to 1700 CE.</p>
              )}
            </CommandGroup>
          )}
          {!query && recentEntries.length > 0 && (
            <CommandGroup heading="Recently opened" className={GROUP_CLASS}>
              {recentEntries.map((item) => (
                <CommandItem key={`recent-${item.href}`} value={`recent ${item.title}`} onSelect={() => go(item.href)} className={ITEM_CLASS}>
                  <ResultRow item={item} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {GROUP_ORDER.map((type) => {
            const items = grouped.get(type);
            if (!items || items.length === 0) return null;
            return (
              <CommandGroup key={type} heading={searchEntryGroupLabel(type)} className={GROUP_CLASS}>
                {items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => go(item.href)}
                    className={ITEM_CLASS}
                  >
                    <ResultRow item={item} />
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
