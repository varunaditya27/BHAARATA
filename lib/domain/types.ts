import { z } from "zod";
import { DateRangeSchema } from "./time";

/**
 * Core object graph (PROJECT_BIBLE.md §5-6). This is the authoritative shape
 * for every domain entity until the PostgreSQL/PostGIS layer (Phase II)
 * replaces these as row types. Keep this file the single source of truth —
 * don't let individual components invent their own entity shapes.
 */

export const ProvenanceSchema = z.object({
  sourceId: z.string(),
  note: z.string().optional(),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const GeometryConfidence = z.enum(["high", "medium", "low", "illustrative"]);
export type GeometryConfidence = z.infer<typeof GeometryConfidence>;

export const PolitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nativeName: z.string().optional(),
  /** Language code of `nativeName` (ta, kn, hi, fa…), so it is announced and shaped correctly. */
  nativeLang: z.string().optional(),
  alternativeNames: z.array(z.string()).default([]),
  polityType: z.string(),
  period: DateRangeSchema,
  region: z.string(),
  capitals: z.array(z.string()),
  language: z.string().optional(),
  religion: z.string().optional(),
  notableFor: z.string().optional(),
  summary: z.string(),
  quote: z.string().optional(),
  accentColor: z.string(),
  heroImageKey: z.string().optional(),
  rulerIds: z.array(z.string()).default([]),
  provenance: z.array(ProvenanceSchema).default([]),
});
export type Polity = z.infer<typeof PolitySchema>;

export const PersonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nativeName: z.string().optional(),
  nativeLang: z.string().optional(),
  role: z.string(),
  period: DateRangeSchema,
  /** Whether `period` is a reign (the default) or only the person's lifetime,
   * when no reign dates are known. Pages word the two differently. */
  datesAre: z.enum(["reign", "lifetime"]).optional(),
  polityId: z.string().optional(),
  summary: z.string().optional(),
  imageKey: z.string().optional(),
  provenance: z.array(ProvenanceSchema).default([]),
});
export type Person = z.infer<typeof PersonSchema>;

export const PlaceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nativeName: z.string().optional(),
  nativeLang: z.string().optional(),
  placeType: z.string(),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  region: z.string(),
  imageKey: z.string().optional(),
  provenance: z.array(ProvenanceSchema).default([]),
});
export type Place = z.infer<typeof PlaceSchema>;

export const RouteSchema = z.object({
  id: z.string(),
  label: z.string(),
  routeType: z.enum(["trade", "campaign", "maritime"]),
  polityIds: z.array(z.string()).default([]),
  validFrom: z.number().int(),
  validTo: z.number().int(),
  path: z.custom<GeoJSON.LineString>(),
  confidence: GeometryConfidence,
  provenance: z.array(ProvenanceSchema).default([]),
});
export type HistoricalRoute = z.infer<typeof RouteSchema>;

export const HistoricalBoundarySchema = z.object({
  polityId: z.string(),
  validFrom: z.number().int(),
  validTo: z.number().int(),
  geometry: z.custom<GeoJSON.Polygon | GeoJSON.MultiPolygon>(),
  confidence: GeometryConfidence,
  provenance: z.array(ProvenanceSchema).default([]),
});
export type HistoricalBoundary = z.infer<typeof HistoricalBoundarySchema>;

export const EventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  period: DateRangeSchema,
  summary: z.string(),
  polityIds: z.array(z.string()).default([]),
  placeIds: z.array(z.string()).default([]),
  /** "milestone": a hand-picked turning point (the atlas pauses on these
   * during playback). "battle": one of many imported battles, shown on the
   * map and in the chronology without pausing playback. */
  category: z.enum(["milestone", "battle"]).optional(),
  /** Where it happened, as [lng, lat], for events that have no Place record. */
  location: z.tuple([z.number(), z.number()]).optional(),
  provenance: z.array(ProvenanceSchema).default([]),
});
export type HistoricalEvent = z.infer<typeof EventSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.enum([
    "bibliographic",
    "archival",
    "archaeological",
    "epigraphic",
    "numismatic",
    "cartographic",
    "digital",
  ]),
  citation: z.string(),
  /** Where a reader can check it, when it is online (e.g. a scan). */
  url: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

/**
 * Uncertainty is rated per-dimension, not as one blended "confidence"
 * score — a claim can be geographically certain but interpretively
 * disputed. PROJECT_BIBLE.md §9: the evidence layer must let a reader
 * ask "how do we know this?" and get an actionable, honest answer.
 */
export const UncertaintyLevel = z.enum(["high", "medium", "low"]);
export type UncertaintyLevel = z.infer<typeof UncertaintyLevel>;

export const EvidenceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  evidenceType: z.enum([
    "inscription",
    "coin",
    "monument",
    "manuscript",
    "seal",
    "sculpture",
    "archival",
  ]),
  period: DateRangeSchema,
  material: z.string().optional(),
  script: z.string().optional(),
  language: z.string().optional(),
  placeId: z.string().optional(),
  catalogueId: z.string().optional(),
  condition: z.string().optional(),
  imageKey: z.string().optional(),
  imageIsIllustrative: z.boolean().default(false),
  transcription: z.array(z.string()).default([]),
  /** True while the transcription/translation are placeholder lines, not a reading of a real text. */
  textIsIllustrative: z.boolean().default(false),
  /** The transcription in Latin letters (ISO 15919), index-matched to it. */
  transliteration: z.array(z.string()).default([]),
  translation: z.array(z.string()).default([]),
  /** Approximate, hand-placed regions (0-1 fractions of image width/height)
   * — not derived from real OCR/IIIF annotation. Index-matched to
   * `transcription`. Lets a reader click a line and see roughly where on
   * the image it would sit; see imageIsIllustrative for the honesty
   * caveat this inherits. */
  lineRegions: z
    .array(z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }))
    .default([]),
  claim: z.string(),
  claimIsIllustrative: z.boolean().default(false),
  interpretation: z.string().optional(),
  uncertainty: z
    .object({
      dating: UncertaintyLevel,
      interpretation: UncertaintyLevel,
      geographic: UncertaintyLevel,
    })
    .optional(),
  sourceIds: z.array(z.string()).default([]),
  polityIds: z.array(z.string()).default([]),
  provenance: z.array(ProvenanceSchema).default([]),
});
export type Evidence = z.infer<typeof EvidenceSchema>;
