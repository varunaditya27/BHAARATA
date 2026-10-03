"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { RakingLight } from "@/components/evidence/RakingLight";
import { cn } from "@/lib/utils/cn";
import type { ImageCredit } from "@/lib/data/images";
import type { Evidence } from "@/lib/domain/types";

/**
 * Owns the shared state between the photo and the text: which line is
 * chosen (the viewer glides to its region) and which is hovered (its box
 * and both its lines light up, from either side).
 */
export function EvidenceInvestigation({
  record,
  image,
}: {
  record: Evidence;
  image: ImageCredit;
}) {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [hoverLine, setHoverLine] = useState<number | null>(null);
  const hasRoman = record.transliteration.length === record.transcription.length && record.transcription.length > 0;
  const [script, setScript] = useState<"original" | "roman">("original");
  const [raking, setRaking] = useState(false);
  const [azimuth, setAzimuth] = useState(300);
  const shownLines = script === "roman" && hasRoman ? record.transliteration : record.transcription;
  const lit = (i: number) => activeLine === i || hoverLine === i;
  const lineProps = (i: number) => ({
    onClick: () => setActiveLine(activeLine === i ? null : i),
    onMouseEnter: () => setHoverLine(i),
    onMouseLeave: () => setHoverLine(null),
    onFocus: () => setHoverLine(i),
    onBlur: () => setHoverLine(null),
    "aria-pressed": activeLine === i,
    // With no hand-placed regions there is nothing to zoom to: the lines are just text.
    disabled: record.lineRegions.length === 0,
  });

  return (
    <div>
      <EvidenceViewer
        credit={image}
        regions={record.lineRegions}
        focus={activeLine}
        highlighted={hoverLine}
        onHoverRegion={setHoverLine}
        onPickRegion={(i) => setActiveLine(activeLine === i ? null : i)}
        overlay={raking ? <RakingLight src={image.file} azimuth={azimuth} /> : undefined}
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border border-border px-3 py-2 font-sans text-xs">
        <button
          onClick={() => setRaking((r) => !r)}
          aria-pressed={raking}
          className={cn("border px-2 py-0.5 transition-colors", raking ? "border-ink bg-ink text-paper" : "border-border text-ink hover:border-ink")}
        >
          Side lighting {raking ? "on" : "off"}
        </button>
        <label className={cn("flex flex-1 items-center gap-2", !raking && "opacity-40")}>
          <span className="shrink-0 text-ink-muted">Light from</span>
          <input
            type="range"
            min={0}
            max={359}
            value={azimuth}
            disabled={!raking}
            onChange={(e) => setAzimuth(Number(e.target.value))}
            aria-valuetext={`${azimuth} degrees`}
            className="min-w-24 flex-1 accent-[#c4553a]"
          />
          <span className="w-8 shrink-0 tabular-nums text-ink-muted">{azimuth}°</span>
        </label>
      </div>
      {raking && (
        <p className="mt-1.5 font-sans text-xs text-ink-muted">
          A computer simulation: the photo is relit as if a lamp were held low to one side, which can make worn letters
          easier to see. It guesses the shape of the stone from light and dark patches, so stains can look like carving.
        </p>
      )}
      <p className="mt-2 font-sans text-xs text-ink-muted">
        {record.imageIsIllustrative
          ? `${image.title} — a similar inscription, not the one described on this page`
          : image.title}{" "}
        ·{" "}
        <a
          href={image.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          {image.artist}, {image.license}
        </a>
      </p>
      {record.lineRegions.length > 0 && (
        <p className="mt-1 font-sans text-xs text-ink-muted">
          Point at a line to see where it is on the stone; click it to zoom in. Scroll to zoom and drag to move around.
          The boxes were placed by hand and are approximate.{hasRoman && " Romanised spellings follow the ISO 15919 standard."}
        </p>
      )}

      {(record.transcription.length > 0 || record.translation.length > 0) && (
        <div className={cn("mt-8 grid gap-8", record.transcription.length > 0 && record.translation.length > 0 && "sm:grid-cols-2")}>
          {record.transcription.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <Eyebrow>Transcription</Eyebrow>
                {hasRoman && (
                  <div role="group" aria-label="Show the transcription in" className="flex border border-border font-sans text-[0.7rem]">
                    {(
                      [
                        ["original", record.script ? `${record.script} script` : "Original"],
                        ["roman", "Romanised"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setScript(value)}
                        aria-pressed={script === value}
                        className={cn("px-2 py-0.5 transition-colors", script === value ? "bg-ink text-paper" : "text-ink-muted hover:text-ink")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ol className="mt-3 space-y-1" lang={script === "roman" ? "ta-Latn" : "ta"}>
                {shownLines.map((line, i) => (
                  <li key={i}>
                    <button
                      {...lineProps(i)}
                      className={cn(
                        "flex w-full gap-2 px-2 py-1.5 text-left text-sm transition-colors",
                        script === "roman" ? "font-sans italic" : "font-indic",
                        lit(i) ? "bg-territory/15 text-ink" : "text-ink",
                      )}
                    >
                      {record.lineRegions.length > 0 && <span className="text-ink-muted tabular-nums">{i + 1}</span>}
                      <span>{line}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {record.translation.length > 0 && (
            <div>
              <Eyebrow>Translation</Eyebrow>
              <ol className="mt-3 space-y-1">
                {record.translation.map((line, i) => (
                  <li key={i}>
                    <button
                      {...lineProps(i)}
                      className={cn(
                        "flex w-full gap-2 px-2 py-1.5 text-left font-sans text-sm transition-colors",
                        lit(i) ? "bg-territory/15 text-ink" : "text-ink",
                      )}
                    >
                      {record.lineRegions.length > 0 && <span className="text-ink-muted tabular-nums">{i + 1}</span>}
                      <span>{line}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
