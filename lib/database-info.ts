import { database } from "@/lib/database";

export const tableNames: Record<string, string> = {
  kingdoms: "Kingdoms", people: "People", places: "Places", events: "Events", sources: "Sources", images: "Images",
  historical_items: "Historical items", item_text_lines: "Words from historical items",
  kingdom_borders: "Kingdom borders", routes: "Routes", kingdom_capitals: "Kingdom capitals",
  event_kingdoms: "Events and kingdoms", event_places: "Events and places", route_kingdoms: "Routes and kingdoms", item_kingdoms: "Items and kingdoms",
  other_names: "Other names", information_sources: "Sources for information",
};

export async function getConnections() {
  const links = await database.$queryRaw<{ from_table: string; to_table: string }[]>`
    SELECT DISTINCT source.relname AS from_table, target.relname AS to_table
    FROM pg_constraint c
    JOIN pg_class source ON source.oid = c.conrelid
    JOIN pg_class target ON target.oid = c.confrelid
    JOIN pg_namespace ns ON ns.oid = source.relnamespace
    WHERE c.contype = 'f' AND ns.nspname = 'public'
    ORDER BY source.relname, target.relname`;
  return links.filter(({ from_table, to_table }) => tableNames[from_table] && tableNames[to_table]);
}
