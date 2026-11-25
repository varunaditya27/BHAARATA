"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useStoredFlag } from "@/lib/utils/use-stored-flag";

/** "/" is "home", "/people/rajaraja-i" is "people-rajaraja-i": the file name of that page's spoken description. */
const clipFor = (pathname: string) => (pathname === "/" ? "home" : pathname.slice(1).replace(/\/$/, "").replace(/\//g, "-"));

type Manifest = { narration: Set<string>; sfx: Set<string> };

let manifest: Promise<Manifest> | null = null;
let loaded: Manifest | null = null;

/** The audio files that exist, read once. Without the list, nothing is requested and the app is silent. */
function audioManifest(): Promise<Manifest> {
  manifest ??= fetch("/audio-manifest.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : { narration: [], sfx: [] }))
    .catch(() => ({ narration: [], sfx: [] }))
    .then((m: { narration?: string[]; sfx?: string[] }) => (loaded = { narration: new Set(m.narration ?? []), sfx: new Set(m.sfx ?? []) }));
  return manifest;
}

const sounds = new Map<string, HTMLAudioElement>();

/** Plays a short interface sound if that sound exists. Copies of one loaded element let sounds overlap, as quick clicks do. */
function play(name: string, volume: number) {
  if (!loaded?.sfx.has(name)) return;
  let base = sounds.get(name);
  if (!base) {
    base = new Audio(`/sfx/${name}.mp3`);
    base.preload = "auto";
    sounds.set(name, base);
  }
  const copy = base.cloneNode() as HTMLAudioElement;
  copy.volume = volume;
  copy.play().catch(() => {});
}

const toggle =
  "flex h-9 items-center gap-1.5 border px-2.5 font-sans text-sm transition-colors";

export function AudioControls() {
  const pathname = usePathname();
  const [voice, setVoice] = useStoredFlag("bh-voice");
  const [effects, setEffects] = useStoredFlag("bh-effects");
  const [asked, setAsked] = useStoredFlag("bh-audio-asked");
  const [speaking, setSpeaking] = useState(false);
  const first = useRef(true);

  // Speak the page's description each time the page changes. A short wait lets the page settle first.
  useEffect(() => {
    if (!voice) return;
    const key = clipFor(pathname);
    let cancelled = false;
    let armed = false;
    let audio: HTMLAudioElement | null = null;
    const start = () => {
      if (cancelled || !audio) return;
      audio.play().then(() => setSpeaking(true)).catch(() => {
        // Browsers allow sound only after a click or key press, so wait for the first one.
        if (armed || cancelled) return;
        armed = true;
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
      });
    };
    let timer = 0;
    audioManifest().then((m) => {
      // A page without a recorded clip stays quiet and makes no request.
      if (cancelled || !m.narration.has(key)) return;
      audio = new Audio(`/narration/${key}.mp3`);
      audio.volume = 0.95;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      timer = window.setTimeout(start, 700);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      audio?.pause();
      setSpeaking(false);
    };
  }, [pathname, voice]);

  // Know which sounds exist before the first one is needed.
  useEffect(() => {
    if (effects) void audioManifest();
  }, [effects]);

  // A sound for moving to a new page; the kingdom, evidence and search pages each get their own.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!effects) return;
    play("whoosh", 0.3);
    if (pathname.startsWith("/polities/")) window.setTimeout(() => play("bell", 0.28), 250);
    else if (pathname.startsWith("/evidence/")) window.setTimeout(() => play("pluck", 0.32), 250);
    else if (pathname === "/search") window.setTimeout(() => play("chime", 0.25), 250);
  }, [pathname, effects]);

  // One listener for the whole page, so no component needs to know about sound.
  useEffect(() => {
    if (!effects) return;
    let lastHover = 0;
    let lastTick = 0;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest("a, button, summary, [role=button], label:has(input[type=checkbox])")) play("click", 0.35);
    };
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest("header a, header button, nav a");
      const now = performance.now();
      if (target && now - lastHover > 90) {
        lastHover = now;
        play("hover", 0.12);
      }
    };
    const onInput = (e: Event) => {
      const now = performance.now();
      if ((e.target as HTMLInputElement | null)?.type === "range" && now - lastTick > 50) {
        lastTick = now;
        play("tick", 0.2);
      }
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("input", onInput, true);
    };
  }, [effects]);

  const accept = () => {
    setAsked(true);
    setVoice(true);
    setEffects(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setVoice(!voice)}
        aria-pressed={voice}
        aria-label="Spoken descriptions"
        title={voice ? "Turn the spoken descriptions off" : "Hear a short description of each page"}
        className={cn(toggle, voice ? "border-ink text-ink" : "border-border text-ink-muted hover:border-ink hover:text-ink")}
      >
        <span
          aria-hidden
          className={cn("h-2 w-2 rounded-full transition-colors", speaking ? "bg-territory" : voice ? "bg-ink" : "bg-border")}
        />
        <span className="hidden 2xl:inline">Voice</span>
      </button>
      <button
        type="button"
        onClick={() => setEffects(!effects)}
        aria-pressed={effects}
        aria-label="Interface sounds"
        title={effects ? "Turn the interface sounds off" : "Turn the interface sounds on"}
        className={cn(toggle, effects ? "border-ink text-ink" : "border-border text-ink-muted hover:border-ink hover:text-ink")}
      >
        <span aria-hidden className={cn("h-2 w-2 rounded-full transition-colors", effects ? "bg-ink" : "bg-border")} />
        <span className="hidden 2xl:inline">Sound</span>
      </button>

      {!asked && (
        <div
          role="dialog"
          aria-label="Sound"
          className="bh-prompt-in fixed bottom-6 left-1/2 z-50 flex w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-4 border border-ink bg-paper-raised px-5 py-4 shadow-xl"
        >
          <p className="flex-1 font-sans text-sm text-ink">Hear a short spoken description of each page, with soft sounds as you move?</p>
          <button
            type="button"
            onClick={accept}
            className="bg-territory px-4 py-2 font-sans text-sm font-medium text-paper-raised transition-colors hover:bg-territory-selected"
          >
            Yes
          </button>
          <button type="button" onClick={() => setAsked(true)} className="font-sans text-sm text-ink underline underline-offset-4">
            No
          </button>
        </div>
      )}
    </>
  );
}
