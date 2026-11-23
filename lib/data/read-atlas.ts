import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { AtlasData } from './atlas-data';
import type { DateRange } from '@/lib/domain/time';
import { EvidenceSchema, SourceSchema } from '@/lib/domain/types';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

type DateRow = {start_year:number|null; end_year?:number|null; start_date_type:string; end_date_type?:string; date_confidence:string};
export function period(row: DateRow): DateRange {
  const qualifiers = {exact:'exact',about:'circa',before:'before',after:'after',unknown:'unknown'} as const;
  const confidences = {recorded:'attested',likely:'probable',debated:'disputed',example:'illustrative',unknown:'unknown'} as const;
  const start = qualifiers[row.start_date_type as keyof typeof qualifiers];
  const end = qualifiers[(row.end_date_type ?? 'unknown') as keyof typeof qualifiers];
  const confidence = confidences[row.date_confidence as keyof typeof confidences];
  if (!start || !end || !confidence) throw new Error('A historical record has an unsupported date.');
  return {startYear:row.start_year ?? 0,endYear:row.end_year ?? null,startQualifier:start,endQualifier:end,confidence};
}
const confidence = (s: string) => s === 'example' ? 'illustrative' as const : s as 'high'|'medium'|'low';
type Geometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
type BorderShape = {id:string; outline:Geometry; edge:Geometry|null; label:GeoJSON.Point|null};
type PointShape = {id:string; point:GeoJSON.Point|null};
type RouteShape = {id:string; path:GeoJSON.LineString};

/** Read all records in one consistent database snapshot. */
export async function readAtlas(db: PrismaClient): Promise<AtlasData> {
  return db.$transaction(async tx => {
    const [kingdoms,people,places,events,items,sources,images,names,capitals,links,borders,routes,eventKingdoms,eventPlaces,itemKingdoms,routeKingdoms,lines,borderShapes,placeShapes,eventShapes,routeShapes] = await Promise.all([
      tx.kingdoms.findMany({orderBy:[{display_order:{sort:'asc',nulls:'last'}},{id:'asc'}]}), tx.people.findMany({orderBy:{id:'asc'}}), tx.places.findMany({where:{page_name:{not:null}},orderBy:{id:'asc'}}), tx.events.findMany({orderBy:[{start_year:'asc'},{id:'asc'}]}),
      tx.historical_items.findMany(), tx.sources.findMany(), tx.images.findMany(), tx.other_names.findMany({orderBy:{id:'asc'}}),
      tx.kingdom_capitals.findMany({include:{places:true},orderBy:[{display_order:'asc'},{id:'asc'}]}), tx.information_sources.findMany({orderBy:{id:'asc'}}),
      tx.kingdom_borders.findMany(), tx.routes.findMany(), tx.event_kingdoms.findMany(), tx.event_places.findMany(),
      tx.item_kingdoms.findMany(), tx.route_kingdoms.findMany(), tx.item_text_lines.findMany({orderBy:{line_number:'asc'}}),
      tx.$queryRaw<BorderShape[]>`SELECT id,ST_AsGeoJSON(outline,15)::json AS outline,ST_AsGeoJSON(uncertain_edge,15)::json AS edge,ST_AsGeoJSON(label_point,15)::json AS label FROM kingdom_borders`,
      tx.$queryRaw<PointShape[]>`SELECT id,ST_AsGeoJSON(map_point,15)::json AS point FROM places WHERE page_name IS NOT NULL`,
      tx.$queryRaw<PointShape[]>`SELECT id,ST_AsGeoJSON(map_point,15)::json AS point FROM events`,
      tx.$queryRaw<RouteShape[]>`SELECT id,ST_AsGeoJSON(map_path,15)::json AS path FROM routes`,
    ]);
    const provenance = (key: 'kingdom_id'|'person_id'|'place_id'|'event_id'|'item_id'|'route_id'|'border_id', id: string) => links.filter(l=>l[key]===id).map(l=>({sourceId:l.source_id,note:l.note ?? undefined}));
    const native = (key:'kingdom_id'|'person_id'|'place_id',id:string) => names.find(n=>n[key]===id && n.name_kind==='native');
    const shapes = new Map(borderShapes.map(s=>[s.id,s]));
    const points = new Map(placeShapes.map(s=>[s.id,s.point]));
    const eventPoints = new Map(eventShapes.map(s=>[s.id,s.point]));
    const paths = new Map(routeShapes.map(s=>[s.id,s.path]));
    const frontiers:AtlasData['frontiers']={}; const labels:AtlasData['labels']={};
    const atlasBoundaries:AtlasData['boundaries']=borders.map(b=>{
      const shape=shapes.get(b.id); if(!shape?.outline) throw new Error(`Missing border shape: ${b.id}`);
      const key=`${b.kingdom_id}-${b.from_year}`;
      if(shape.edge) frontiers[key]=shape.edge;
      if(shape.label) labels[key]=shape.label.coordinates as [number,number];
      return {polityId:b.kingdom_id,validFrom:b.from_year,validTo:b.to_year,geometry:shape.outline,confidence:confidence(b.confidence),provenance:provenance('border_id',b.id)};
    });
    return {
      polities:kingdoms.map(k=>{const n=native('kingdom_id',k.id);return {id:k.id,slug:k.page_name,name:k.name,nativeName:n?.name_text,nativeLang:n?.language_code ?? undefined,alternativeNames:names.filter(x=>x.kingdom_id===k.id&&x.name_kind==='other').map(x=>x.name_text),polityType:k.kingdom_type,period:period(k),region:k.region,capitals:capitals.filter(c=>c.kingdom_id===k.id).map(c=>c.name_as_recorded ?? c.places.name),language:k.language ?? undefined,religion:k.religion ?? undefined,notableFor:k.notable_for ?? undefined,summary:k.summary,quote:k.quote ?? undefined,accentColor:k.accent_color,heroImageKey:k.main_image_id ?? undefined,provenance:provenance('kingdom_id',k.id)};}),
      people:people.map(p=>{const n=native('person_id',p.id);return {id:p.id,slug:p.page_name,name:p.name,nativeName:n?.name_text,nativeLang:n?.language_code ?? undefined,role:p.role,period:period(p),datesAre:p.date_kind==='life'?'lifetime':p.date_kind==='time_as_ruler'?'reign':undefined,polityId:p.kingdom_id ?? undefined,summary:p.summary ?? undefined,imageKey:p.portrait_id ?? undefined,provenance:provenance('person_id',p.id)};}),
      places:places.map(p=>{const n=native('place_id',p.id);const point=points.get(p.id);if(!point||!p.page_name)throw new Error(`Missing place location: ${p.id}`);return {id:p.id,slug:p.page_name,name:p.name,nativeName:n?.name_text,nativeLang:n?.language_code ?? undefined,placeType:p.place_kind,coordinates:point.coordinates as [number,number],region:p.region ?? '',imageKey:p.main_image_id ?? undefined,provenance:provenance('place_id',p.id)};}),
      events:events.map(e=>({id:e.id,slug:e.page_name,title:e.title,period:period(e),summary:e.summary,polityIds:[...new Set(eventKingdoms.filter(x=>x.event_id===e.id && (e.category==='battle' ? x.connection==='inside_borders' : x.connection==='related')).map(x=>x.kingdom_id))],placeIds:eventPlaces.filter(x=>x.event_id===e.id).map(x=>x.place_id),category:e.category==='battle'?'battle':e.category==='major_event'?'milestone':undefined,location:eventPoints.get(e.id)?.coordinates as [number,number]|undefined,provenance:provenance('event_id',e.id)})),
      evidence:items.map(e=>{const l=lines.filter(x=>x.item_id===e.id);return EvidenceSchema.parse({id:e.id,slug:e.page_name,title:e.title,evidenceType:e.item_type,period:period(e),material:e.material ?? undefined,script:e.script ?? undefined,language:e.language ?? undefined,placeId:e.place_id ?? undefined,catalogueId:e.book_number ?? undefined,imageKey:e.image_id ?? undefined,imageIsIllustrative:e.image_is_example,textIsIllustrative:e.text_is_example,translation:l.map(x=>x.english_words).filter((x):x is string=>x!==null),claim:e.statement,claimIsIllustrative:e.statement_is_example,interpretation:e.what_it_means ?? undefined,uncertainty:e.date_doubt&&e.place_doubt&&e.meaning_doubt?{dating:e.date_doubt,geographic:e.place_doubt,interpretation:e.meaning_doubt}:undefined,sourceIds:links.filter(c=>c.item_id===e.id).map(c=>c.source_id),polityIds:itemKingdoms.filter(x=>x.item_id===e.id).map(x=>x.kingdom_id),provenance:provenance('item_id',e.id)});}),
      sources:sources.map(s=>SourceSchema.parse({id:s.id,title:s.title,sourceType:s.source_type,citation:s.source_details,url:s.url ?? undefined})),
      boundaries:atlasBoundaries,
      routes:routes.map(r=>{const path=paths.get(r.id);if(!path)throw new Error(`Missing route shape: ${r.id}`);const types={trade:'trade',military:'campaign',sea:'maritime'} as const;const routeType=types[r.route_type as keyof typeof types];if(!routeType)throw new Error(`Invalid route type: ${r.id}`);return {id:r.id,label:r.label,routeType,polityIds:routeKingdoms.filter(x=>x.route_id===r.id).map(x=>x.kingdom_id),validFrom:r.from_year,validTo:r.to_year,path,confidence:confidence(r.confidence),provenance:provenance('route_id',r.id)};}),
      images:Object.fromEntries(images.filter(i=>!i.file_path_or_url.startsWith('/') || existsSync(join(process.cwd(),'public',i.file_path_or_url))).map(i=>{if(!i.alt_text||!i.source_url)throw new Error(`Missing image credit: ${i.id}`);return [i.id,{file:i.file_path_or_url,alt:i.alt_text,title:i.title ?? '',artist:i.image_creator ?? '',license:i.licence,sourceUrl:i.source_url}];})),
      frontiers,labels,
    };
  },{isolationLevel:'RepeatableRead',timeout:30000});
}
