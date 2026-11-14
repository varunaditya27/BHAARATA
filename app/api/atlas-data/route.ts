import { getAtlasData } from '@/lib/data/atlas-server';

export async function GET() {
  return Response.json(await getAtlasData(), { headers: { 'Cache-Control': 'no-store' } });
}
