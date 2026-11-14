import type { Evidence, HistoricalBoundary, HistoricalEvent, HistoricalRoute, ImageCredit, Person, Place, Polity, Source } from '@/lib/domain/types';

export type AtlasData = {
  polities: Polity[];
  people: Person[];
  places: Place[];
  events: HistoricalEvent[];
  evidence: Evidence[];
  sources: Source[];
  boundaries: HistoricalBoundary[];
  routes: HistoricalRoute[];
  images: Record<string, ImageCredit>;
  frontiers: Record<string, GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  labels: Record<string, [number, number]>;
};

export function atlasAccess(data: AtlasData) {
  return {
    getPolityById: (id: string) => data.polities.find(p => p.id === id),
    getPolityBySlug: (slug: string) => data.polities.find(p => p.slug === slug),
    getPersonBySlug: (slug: string) => data.people.find(p => p.slug === slug),
    getPlaceById: (id: string) => data.places.find(p => p.id === id),
    getSourceById: (id: string) => data.sources.find(s => s.id === id),
    getRulersForPolity: (id: string) => data.people.filter(p => p.polityId === id),
    getBoundariesForPolity: (id: string) => data.boundaries.filter(b => b.polityId === id),
    milestones: data.events.filter(e => e.category !== 'battle'),
    battles: data.events.filter(e => e.category === 'battle'),
  };
}
