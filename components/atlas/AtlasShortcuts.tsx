"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { polities } from "@/lib/data/prototype";

export type AtlasShortcutActions = {
  togglePlay: () => void;
  stepYears: (delta: number) => void;
  stepEvent: (direction: 1 | -1) => void;
  selectKingdomAt: (index: number) => void;
  clearSelection: () => void;
  toggleCinema?: () => void;
  toggleCompare?: () => void;
  saveImage?: () => void;
  toggleHelp: () => void;
};

export const SHORTCUTS: { keys: string[]; does: string }[] = [
  { keys: ["Space"], does: "Play or pause" },
  { keys: ["J", "K"], does: "Back or forward 10 years (hold Shift for 50)" },
  { keys: [",", "."], does: "Previous or next event" },
  { keys: ["1", "–", String(Math.min(9, polities.length))], does: "Pick a kingdom from the list" },
  { keys: ["Esc"], does: "Clear the selection" },
  { keys: ["?"], does: "Show or hide this list" },
];

/** Typing in a field, or a shortcut with ⌘/Ctrl (the search palette), is never ours. */
function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return (el as HTMLInputElement).type !== "range" && (el as HTMLInputElement).type !== "checkbox";
  return false;
}

/** Binds the atlas's single-key shortcuts at the window level. */
export function useAtlasShortcuts(actions: AtlasShortcutActions) {
  const ref = useRef(actions);
  useEffect(() => {
    ref.current = actions;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      // A dialog (search palette, mobile menu) owns the keyboard while open.
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const a = ref.current;
      const big = e.shiftKey ? 50 : 10;
      switch (e.key) {
        case " ":
          // A focused button already acts on Space; don't double-fire.
          if ((e.target as HTMLElement | null)?.tagName === "BUTTON") return;
          a.togglePlay();
          break;
        case "j":
        case "J":
          a.stepYears(-big);
          break;
        case "k":
        case "K":
          a.stepYears(big);
          break;
        case ",":
        case "<":
          a.stepEvent(-1);
          break;
        case ".":
        case ">":
          a.stepEvent(1);
          break;
        case "Escape":
          a.clearSelection();
          return; // let Escape also close anything else
        case "c":
        case "C":
          if (!a.toggleCinema) return;
          a.toggleCinema();
          break;
        case "v":
        case "V":
          if (!a.toggleCompare) return;
          a.toggleCompare();
          break;
        case "s":
        case "S":
          if (!a.saveImage) return;
          a.saveImage();
          break;
        case "?":
          a.toggleHelp();
          break;
        default:
          if (/^[1-9]$/.test(e.key)) a.selectKingdomAt(Number(e.key) - 1);
          else return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-ink/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md border border-paper/15 bg-[#24201a] p-6 text-paper shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="region"
            aria-label="Keyboard shortcuts"
          >
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-paper/60">Keyboard</p>
            <h2 className="mt-1 font-display text-2xl">Shortcuts</h2>
            <dl className="mt-5 space-y-2.5 font-sans text-sm">
              {SHORTCUTS.map((s) => (
                <div key={s.does} className="flex items-baseline justify-between gap-6 border-t border-paper/10 pt-2.5">
                  <dt className="flex shrink-0 gap-1">
                    {s.keys.map((k) =>
                      k === "–" ? (
                        <span key={k} className="text-paper/50">
                          –
                        </span>
                      ) : (
                        <kbd key={k} className="min-w-[1.6rem] border border-paper/25 px-1.5 py-0.5 text-center text-xs">
                          {k}
                        </kbd>
                      ),
                    )}
                  </dt>
                  <dd className="text-right text-paper/75">{s.does}</dd>
                </div>
              ))}
            </dl>
            <button onClick={onClose} className="mt-6 font-sans text-xs text-paper/60 underline underline-offset-4 hover:text-paper">
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
