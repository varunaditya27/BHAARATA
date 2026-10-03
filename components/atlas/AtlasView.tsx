"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HistoricalMap } from "@/components/map/HistoricalMap";
import { MapLegend, type LayerToggleId } from "@/components/map/MapLegend";
import { MapLoading } from "@/components/map/MapLoading";
import { composeMapPrint, downloadCanvas } from "@/components/map/export-image";
import { AtlasSidebar } from "@/components/atlas/AtlasSidebar";
import { KingdomChips } from "@/components/atlas/KingdomChips";
import { EraTitleCard } from "@/components/atlas/EraTitleCard";
import { CinemaFrame } from "@/components/atlas/CinemaFrame";
import { EraSoundscape } from "@/components/atlas/era-sound";
import { useStoredFlag } from "@/lib/utils/use-stored-flag";
import { Volume2, VolumeX } from "lucide-react";
import { ComparePane } from "@/components/atlas/ComparePane";
import type { Map as MapLibreMap } from "maplibre-gl";
import { EraGrade } from "@/components/atlas/EraGrade";
import { EventCaption } from "@/components/atlas/EventCaption";
import { ShortcutHelp, useAtlasShortcuts } from "@/components/atlas/AtlasShortcuts";
import { EventTicks } from "@/components/chronology/EventTicks";
import { LifespanStrip } from "@/components/chronology/LifespanStrip";
import { TimelineScrubber, type TimelineChangeSource } from "@/components/chronology/TimelineScrubber";
import { EntityPreviewPanel } from "@/components/entity/EntityPreviewPanel";
import { events, getPlaceById, getPolityBySlug, polities } from "@/lib/data/prototype";
import type { HistoricalEvent } from "@/lib/domain/types";
import { getEraForYear, getHistoricalState, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

const DEFAULT_VISIBLE_LAYERS: LayerToggleId[] = ["territory", "places", "routes", "relief"];
const ERA_CARD_DURATION_MS = 1700;
const URL_COMMIT_DEBOUNCE_MS = 300;
const CAPTION_MS = 5200;
const EVENT_YEARS = events.map((e) => e.period.startYear);
const DEFAULT_YEAR = 1050;

/**
 * URL state is the shareable "exploration" (IMPLEMENTATION_PLAN.md §17):
 * /atlas?year=985&polity=chola is a saved viewpoint, not just navigation.
 *
 * But the URL is not the live interaction state. Dragging the timeline
 * used to call router.replace() on every native <input> tick — tens of
 * times a second — which made the scrub feel sluggish (the map's smooth
 * feature-state opacity transitions were fine; the surrounding
 * React/router churn wasn't). `displayYear` is now the fast local source
 * of truth for the map/sidebar/timeline; the URL catches up on a short
 * debounce once the year settles, so sharing a link still works.
 */
export function AtlasView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visibleLayers, setVisibleLayers] = useState<Set<LayerToggleId>>(
    () => new Set(DEFAULT_VISIBLE_LAYERS),
  );
  const [eraCard, setEraCard] = useState<{ era: string; year: number } | null>(null);
  const prevEraRef = useRef<string | null>(null);
  const eraCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [caption, setCaption] = useState<HistoricalEvent | null>(null);
  const [focus, setFocus] = useState<{ key: string; center: [number, number] } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const handleMapReady = useCallback(() => setMapReady(true), []);
  const captionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cinema, setCinema] = useState(false);
  const captureRef = useRef<(() => Promise<HTMLCanvasElement>) | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const mainMapRef = useRef<MapLibreMap | null>(null);
  // Compare view opens with the left map a century and a half earlier.
  const [compareFrom, setCompareFrom] = useState<number | null>(null);
  // Era sound: off unless chosen, and remembered per browser.
  const [soundOn, setSoundOn] = useStoredFlag("bh-sound");
  const soundRef = useRef<EraSoundscape | null>(null);
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  const toggleCinema = useCallback(() => {
    setCinema((on) => {
      // Entering starts playback (that's what cinema view is for); leaving
      // leaves the play state alone.
      if (!on) setPlaying(true);
      return !on;
    });
  }, []);
  const lastYearRef = useRef<number | null>(null);

  const urlYear = useMemo(() => {
    const raw = Number(searchParams.get("year"));
    if (Number.isFinite(raw) && raw >= PROTOTYPE_YEAR_RANGE.min && raw <= PROTOTYPE_YEAR_RANGE.max) {
      return raw;
    }
    return DEFAULT_YEAR;
  }, [searchParams]);

  const [displayYear, setDisplayYear] = useState(urlYear);
  // Tracks the last urlYear we've already reacted to, so the render-phase
  // sync below (React's documented pattern for "adjust state when a prop
  // changes" without an Effect-driven cascading render) only fires on a
  // genuine external change — back/forward nav, a pasted link — not on
  // every render.
  const [syncedUrlYear, setSyncedUrlYear] = useState(urlYear);
  if (urlYear !== syncedUrlYear) {
    setSyncedUrlYear(urlYear);
    setDisplayYear(urlYear);
  }

  useEffect(() => {
    prevEraRef.current = getEraForYear(urlYear);
    return () => {
      if (eraCardTimeoutRef.current) clearTimeout(eraCardTimeoutRef.current);
      if (urlCommitTimeoutRef.current) clearTimeout(urlCommitTimeoutRef.current);
      if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    };
    // Only seed on mount — subsequent era tracking happens in handleYearChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSlug = searchParams.get("polity");
  const selectedPolity = selectedSlug ? getPolityBySlug(selectedSlug) ?? null : null;
  const historicalState = useMemo(() => getHistoricalState(displayYear), [displayYear]);
  const activePolityIds = useMemo(
    () => new Set(historicalState.activePolities.map((p) => p.id)),
    [historicalState],
  );

  // Reads the live URL, not the `searchParams` snapshot from this render:
  // the debounced year commit below fires ~300ms later, and building from
  // a stale snapshot would silently drop a polity selected in between.
  const pushParams = useCallback(
    (next: { year?: number; polity?: string | null }) => {
      const params = new URLSearchParams(window.location.search);
      if (next.year !== undefined) params.set("year", String(next.year));
      if (next.polity !== undefined) {
        if (next.polity) params.set("polity", next.polity);
        else params.delete("polity");
      }
      router.replace(`/atlas?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleSelectPolity = useCallback(
    (polityId: string | null) => {
      // boundaries/polities share id === slug in the prototype dataset.
      pushParams({ polity: polityId });
    },
    [pushParams],
  );

  /** Lower-third + a camera drift toward the event's first place. */
  const showEvent = useCallback((event: HistoricalEvent) => {
    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    setCaption(event);
    captionTimeoutRef.current = setTimeout(() => setCaption(null), CAPTION_MS);
    const place = event.placeIds[0] ? getPlaceById(event.placeIds[0]) : undefined;
    if (place) setFocus({ key: `${event.id}-${Date.now()}`, center: place.coordinates });
  }, []);

  // Era title cards only fire during auto-play, not manual scrubbing —
  // otherwise dragging the slider across a boundary would interrupt the
  // reader with a full-screen flash on every drag, which is the opposite
  // of cinematic.
  const handleYearChange = useCallback(
    (nextYear: number, source: TimelineChangeSource) => {
      setDisplayYear(nextYear);

      if (urlCommitTimeoutRef.current) clearTimeout(urlCommitTimeoutRef.current);
      urlCommitTimeoutRef.current = setTimeout(() => {
        pushParams({ year: nextYear });
      }, URL_COMMIT_DEBOUNCE_MS);

      // Playback narrates: an event whose start year was just reached gets
      // its caption. Manual scrubbing clears captions instead of spawning
      // them — dragging shouldn't throw up a card at every mark.
      const previous = lastYearRef.current;
      lastYearRef.current = nextYear;
      if (source === "auto" && previous !== null) {
        const reached = events.find((e) => e.period.startYear > previous && e.period.startYear <= nextYear);
        if (reached) showEvent(reached);
      } else if (source === "manual") {
        setCaption(null);
      }

      const era = getEraForYear(nextYear);
      if (source === "auto" && era !== prevEraRef.current && prevEraRef.current !== null && soundOnRef.current) {
        soundRef.current?.gong();
      }
      if (source === "auto" && era !== prevEraRef.current) {
        if (eraCardTimeoutRef.current) clearTimeout(eraCardTimeoutRef.current);
        setEraCard({ era, year: nextYear });
        eraCardTimeoutRef.current = setTimeout(() => setEraCard(null), ERA_CARD_DURATION_MS);
      }
      prevEraRef.current = era;
    },
    [pushParams, showEvent],
  );

  const currentEra = getEraForYear(displayYear);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      soundRef.current ??= new EraSoundscape();
      soundRef.current.start(currentEra);
    } else soundRef.current?.stop();
  };

  // The drone follows the era, however the year got there.
  useEffect(() => {
    if (soundOn) soundRef.current?.setEra(currentEra);
  }, [soundOn, currentEra]);

  // Sound remembered as on: browsers only allow audio after an
  // interaction, so start on the first click or key press.
  useEffect(() => {
    if (!soundOn || soundRef.current?.running) return;
    const begin = () => {
      soundRef.current ??= new EraSoundscape();
      soundRef.current.start(getEraForYear(lastYearRef.current ?? displayYear));
    };
    window.addEventListener("pointerdown", begin, { once: true });
    window.addEventListener("keydown", begin, { once: true });
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };
    // Only (re)arm when the preference changes, not on every year.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  useEffect(() => () => soundRef.current?.dispose(), []);

  const saveImage = async () => {
    const capture = captureRef.current;
    if (!capture) return;
    const yearLabel = displayYear < 0 ? `${Math.abs(displayYear)} BCE` : `${displayYear} CE`;
    const print = composeMapPrint(await capture(), {
      year: yearLabel,
      era: getEraForYear(displayYear),
      kingdoms: historicalState.activePolities,
      credits: "© CARTO · © OpenStreetMap contributors · Terrain Tiles (Mapzen, AWS Open Data)",
    });
    const filename = `bharata-${yearLabel.toLowerCase().replace(" ", "-")}.png`;
    downloadCanvas(print, filename);
    setSavedNote(`Saved ${filename}`);
    setTimeout(() => setSavedNote(null), 2600);
  };

  const clampYear = (y: number) => Math.min(PROTOTYPE_YEAR_RANGE.max, Math.max(PROTOTYPE_YEAR_RANGE.min, y));

  useAtlasShortcuts({
    togglePlay: () => setPlaying((p) => !p),
    stepYears: (delta) => {
      setPlaying(false);
      handleYearChange(clampYear(displayYear + delta), "manual");
    },
    stepEvent: (direction) => {
      const sorted = [...events].sort((a, b) => a.period.startYear - b.period.startYear);
      const next =
        direction === 1
          ? sorted.find((e) => e.period.startYear > displayYear)
          : [...sorted].reverse().find((e) => e.period.startYear < displayYear);
      if (!next) return;
      setPlaying(false);
      handleYearChange(next.period.startYear, "manual");
      showEvent(next);
    },
    selectKingdomAt: (index) => {
      const p = polities[index];
      if (!p) return;
      // Picking a kingdom that doesn't exist this year jumps to its start.
      if (!activePolityIds.has(p.id)) handleYearChange(clampYear(p.period.startYear), "manual");
      handleSelectPolity(p.id);
    },
    clearSelection: () => {
      if (helpOpen) setHelpOpen(false);
      else if (cinema) setCinema(false);
      else handleSelectPolity(null);
    },
    toggleCinema,
    saveImage,
    toggleSound,
    toggleCompare: () =>
      setCompareFrom((from) => (from === null ? Math.max(PROTOTYPE_YEAR_RANGE.min, displayYear - 150) : null)),
    toggleHelp: () => setHelpOpen((o) => !o),
  });

  const toggleLayer = useCallback((id: LayerToggleId) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className={cinema ? "bh-cinema fixed inset-0 z-50 flex flex-col bg-black" : "flex h-[calc(100dvh-4rem)] flex-col bg-ink"}>
      <div className="flex flex-1 overflow-hidden">
        {!cinema && <AtlasSidebar
          allPolities={polities}
          activePolityIds={activePolityIds}
          selectedPolityId={selectedPolity?.id ?? null}
          onSelectPolity={handleSelectPolity}
        />}
        {compareFrom !== null && !cinema && (
          <ComparePane
            leaderRef={mainMapRef}
            initialYear={compareFrom}
            visibleLayers={visibleLayers}
            onClose={() => setCompareFrom(null)}
          />
        )}

        <div className="relative flex-1 overflow-hidden">
          <HistoricalMap
            year={displayYear}
            selectedPolityId={selectedPolity?.id ?? null}
            onSelectPolity={handleSelectPolity}
            visibleLayers={visibleLayers}
            focus={focus}
            onReady={handleMapReady}
            captureRef={captureRef}
            instanceRef={mainMapRef}
          />
          <EraGrade year={displayYear} />
          {compareFrom !== null && !cinema && (
            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 hidden justify-end pr-14 md:flex">
              <p className="bg-ink/85 px-3 py-1 font-display text-lg text-paper">
                {displayYear} CE{" "}
                <span className="ml-1 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-paper/60">
                  {getEraForYear(displayYear)}
                </span>
              </p>
            </div>
          )}
          <div className="bh-map-grain pointer-events-none absolute inset-0" />
          <MapLoading visible={!mapReady} />

          {!cinema && (
            <>
              <KingdomChips
                allPolities={polities}
                activePolityIds={activePolityIds}
                selectedPolityId={selectedPolity?.id ?? null}
                onSelectPolity={handleSelectPolity}
              />
              <div className="pointer-events-none absolute left-3 top-14 md:left-4 md:top-4">
                <div className="pointer-events-auto w-fit">
                  <MapLegend visible={visibleLayers} onToggle={toggleLayer} />
                </div>
              </div>
              <EntityPreviewPanel polity={selectedPolity} onClose={() => pushParams({ polity: null })} />
            </>
          )}
          <EventCaption event={caption} raised={cinema} />
          <CinemaFrame on={cinema} year={displayYear} onExit={toggleCinema} />
          <EraTitleCard era={eraCard?.era ?? null} year={eraCard?.year ?? displayYear} />
          <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
          <button
            hidden={cinema}
            onClick={() => setHelpOpen(true)}
            className="absolute bottom-3 left-[150px] z-10 hidden border border-ink/20 bg-paper-raised/85 px-2 py-0.5 font-sans text-[0.7rem] text-ink-muted backdrop-blur-sm hover:text-ink md:block"
            aria-label="Keyboard shortcuts"
          >
            Shortcuts <kbd className="ml-1 font-sans">?</kbd>
          </button>
          <button
            hidden={cinema}
            onClick={saveImage}
            className="absolute bottom-3 left-[240px] z-10 hidden border border-ink/20 bg-paper-raised/85 px-2 py-0.5 font-sans text-[0.7rem] text-ink-muted backdrop-blur-sm hover:text-ink md:block"
          >
            Save image <kbd className="ml-1 font-sans">S</kbd>
          </button>
          <button
            hidden={cinema}
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="absolute bottom-3 left-[345px] z-10 hidden items-center gap-1 border border-ink/20 bg-paper-raised/85 px-2 py-0.5 font-sans text-[0.7rem] text-ink-muted backdrop-blur-sm hover:text-ink md:flex"
          >
            {soundOn ? <Volume2 size={12} aria-hidden /> : <VolumeX size={12} aria-hidden />}
            Sound {soundOn ? "on" : "off"} <kbd className="ml-1 font-sans">M</kbd>
          </button>
          {savedNote && (
            <p role="status" className="bh-fade-in absolute bottom-10 left-[150px] z-10 bg-ink/90 px-2.5 py-1 font-sans text-xs text-paper">
              {savedNote}
            </p>
          )}
        </div>
      </div>

      {/* Hidden, not unmounted, in cinema view: the scrubber owns the playback clock. */}
      <div hidden={cinema} className="border-t border-paper/10 bg-ink px-4 py-3 md:px-6 md:py-4">
        <TimelineScrubber
          year={displayYear}
          onYearChange={handleYearChange}
          holdYears={EVENT_YEARS}
          playing={playing}
          onPlayingChange={setPlaying}
          aboveTrack={
            <>
            <LifespanStrip
              polities={polities}
              year={displayYear}
              min={PROTOTYPE_YEAR_RANGE.min}
              max={PROTOTYPE_YEAR_RANGE.max}
              selectedPolityId={selectedPolity?.id ?? null}
              onJump={(p) => {
                handleYearChange(Math.max(PROTOTYPE_YEAR_RANGE.min, p.period.startYear), "manual");
                handleSelectPolity(p.id);
              }}
            />
            <EventTicks
              events={events}
              year={displayYear}
              min={PROTOTYPE_YEAR_RANGE.min}
              max={PROTOTYPE_YEAR_RANGE.max}
              onJump={(e) => {
                handleYearChange(e.period.startYear, "manual");
                showEvent(e);
              }}
            />
            </>
          }
        />
      </div>
    </div>
  );
}
