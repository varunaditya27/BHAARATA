"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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

/**
 * The sound of the site: each page's spoken description and the interface sounds. Both are always on.
 * Browsers allow sound only after a first click or key press, so the first page waits for one.
 */
export function PageAudio() {
  const pathname = usePathname();
  const first = useRef(true);

  // Speak the page's description each time the page changes. A short wait lets the page settle first.
  useEffect(() => {
    const key = clipFor(pathname);
    let cancelled = false;
    let armed = false;
    let audio: HTMLAudioElement | null = null;
    const start = () => {
      if (cancelled || !audio) return;
      audio.play().catch(() => {
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
      timer = window.setTimeout(start, 700);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      audio?.pause();
    };
  }, [pathname]);

  // A sound for moving to a new page; the kingdom, evidence and search pages each get their own.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    audioManifest().then(() => {
      play("whoosh", 0.3);
      if (pathname.startsWith("/polities/")) window.setTimeout(() => play("bell", 0.28), 250);
      else if (pathname.startsWith("/evidence/")) window.setTimeout(() => play("pluck", 0.32), 250);
      else if (pathname === "/search") window.setTimeout(() => play("chime", 0.25), 250);
    });
  }, [pathname]);

  // One listener for the whole page, so no component needs to know about sound.
  useEffect(() => {
    void audioManifest();
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
  }, []);

  return null;
}
