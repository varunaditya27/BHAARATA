"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";

export type EntityTabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};

/** Editorial underline tabs — not pill buttons. Built on Radix for free
 * keyboard navigation (arrow keys move between tabs, per PROJECT_BIBLE.md
 * §17's keyboard-interaction requirement). */
export function EntityTabs({ items, defaultValue }: { items: EntityTabItem[]; defaultValue: string }) {
  return (
    <Tabs.Root defaultValue={defaultValue}>
      <Tabs.List className="flex gap-6 border-b border-border font-sans text-sm">
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "border-b-2 border-transparent py-3 text-ink-muted transition-colors",
              "data-[state=active]:border-ink data-[state=active]:text-ink",
              "hover:text-ink",
            )}
          >
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content key={item.value} value={item.value} className="pt-8">
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
