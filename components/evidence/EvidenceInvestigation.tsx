"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ZoomableImage } from "@/components/evidence/ZoomableImage";
import { cn } from "@/lib/utils/cn";
import type { ImageCredit } from "@/lib/data/images";
import type { Evidence } from "@/lib/domain/types";

/**
 * Owns the one piece of shared state this interaction needs: which line
 * is active. Clicking a transcription or translation line pans/zooms the
 * image toward its (hand-placed, illustrative) region and highlights the
 * matching line in both columns.
 */
export function EvidenceInvestigation({
  record,
  image,
}: {
  record: Evidence;
  image: ImageCredit;
}) {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const region = activeLine !== null ? record.lineRegions[activeLine] ?? null : null;

  return (
    <div>
      <div className="relative">
        <ZoomableImage credit={image} region={region} frameClassName="aspect-[4/3]" />
        {activeLine !== null && (
          <button
            onClick={() => setActiveLine(null)}
            className="absolute right-3 top-3 bg-ink/80 px-3 py-1.5 font-sans text-xs text-paper hover:bg-ink"
          >
            Show full image
          </button>
        )}
      </div>
      <p className="mt-2 font-sans text-xs text-ink-muted">
        {record.imageIsIllustrative
          ? `${image.title} — representative photograph, not the specific object described below`
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
          Click a line below to pan the image toward it (regions are hand-placed and illustrative).
        </p>
      )}

      {(record.transcription.length > 0 || record.translation.length > 0) && (
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {record.transcription.length > 0 && (
            <div>
              <Eyebrow>Transcription</Eyebrow>
              <ol className="mt-3 space-y-1">
                {record.transcription.map((line, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setActiveLine(activeLine === i ? null : i)}
                      className={cn(
                        "flex w-full gap-2 px-2 py-1.5 text-left font-indic text-sm transition-colors",
                        activeLine === i ? "bg-territory/15 text-ink" : "text-ink hover:bg-stone/50",
                      )}
                    >
                      <span className="text-ink-muted tabular-nums">{i + 1}</span>
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
                      onClick={() => setActiveLine(activeLine === i ? null : i)}
                      className={cn(
                        "flex w-full gap-2 px-2 py-1.5 text-left font-sans text-sm transition-colors",
                        activeLine === i ? "bg-territory/15 text-ink" : "text-ink hover:bg-stone/50",
                      )}
                    >
                      <span className="text-ink-muted tabular-nums">{i + 1}</span>
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
