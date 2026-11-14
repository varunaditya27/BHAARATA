import { database } from '@/lib/database';

export async function GET(_request: Request, {params}: {params:Promise<{kind:string}>}) {
  const {kind} = await params;
  if (kind !== 'sites' && kind !== 'monuments') return new Response('Not found', {status:404});
  const rows = kind === 'sites'
    ? await database.$queryRaw<{collection: GeoJSON.FeatureCollection}[]>`
        SELECT json_build_object('type','FeatureCollection','features',COALESCE(json_agg(json_build_object(
          'type','Feature',
          'properties', p.map_properties || jsonb_build_object('n',p.name,'t',p.place_kind,'y',p.start_year),
          'geometry', ST_AsGeoJSON(p.map_point,15)::json
        )), '[]'::json)) AS collection
        FROM places p WHERE p.start_year IS NOT NULL AND p.map_properties IS NOT NULL AND p.map_properties ? 'y'`
    : await database.$queryRaw<{collection: GeoJSON.FeatureCollection}[]>`
        SELECT json_build_object('type','FeatureCollection','features',COALESCE(json_agg(json_build_object(
          'type','Feature',
          'properties', p.map_properties || jsonb_build_object('n',p.name),
          'geometry', ST_AsGeoJSON(p.map_point,15)::json
        )), '[]'::json)) AS collection
        FROM places p WHERE p.protected_place = true AND p.map_properties IS NOT NULL`;
  return Response.json(rows[0].collection, {headers:{'Cache-Control':'no-store'}});
}
