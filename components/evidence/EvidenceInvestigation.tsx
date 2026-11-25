"use client";

import { useState } from "react";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { RakingLight } from "@/components/evidence/RakingLight";
import { cn } from "@/lib/utils/cn";
import type { Evidence, ImageCredit } from "@/lib/domain/types";

export function EvidenceInvestigation({
  record,
  image,
}: {
  record: Evidence;
  image: ImageCredit;
}) {
  const [raking, setRaking] = useState(false);
  const [azimuth, setAzimuth] = useState(300);

  return (
    <div>
      <EvidenceViewer
        credit={image}
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
            className="min-w-24 flex-1 accent-[#ff5a3c]"
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

      {record.translation.length > 0 && (
        <div className="mt-8">
          <h2 className="font-sans text-sm font-medium text-ink-muted">English translation</h2>
          <ol className="mt-3 space-y-1">
            {record.translation.map((line, i) => (
              <li key={i} className="px-2 py-1.5 font-sans text-sm text-ink">
                {line}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
