export const tableNames: Record<string, string> = {
  kingdoms: "Kingdoms",
  people: "People",
  places: "Places",
  events: "Events",
  sources: "Sources",
  images: "Images",
  historical_items: "Historical items",
  item_text_lines: "Words from historical items",
  kingdom_borders: "Kingdom borders",
  routes: "Routes",
  kingdom_capitals: "Kingdom capitals",
  event_kingdoms: "Events and kingdoms",
  event_places: "Events and places",
  route_kingdoms: "Routes and kingdoms",
  item_kingdoms: "Items and kingdoms",
  other_names: "Other names",
  information_sources: "Sources for information",
};

export type TableCategory = "core" | "spatial" | "relations";

export const tableDetails: Record<
  string,
  { category: TableCategory; summary: string; primaryRoute?: string }
> = {
  kingdoms: {
    category: "core",
    summary:
      "55 kingdoms, empires, and sultanates across the subcontinent (600–1700 CE), with dates, language, religion, pigment colour, and hero photograph.",
    primaryRoute: "/polities/",
  },
  people: {
    category: "core",
    summary:
      "584 rulers and historical figures linked to their kingdom, reign or lifetime years, title, summary, and dedicated portrait or coin image.",
    primaryRoute: "/people/",
  },
  places: {
    category: "core",
    summary:
      "392 geolocated places—capitals, dated temples, forts, mosques, tombs, monasteries, and protected monuments—stored as PostGIS points.",
    primaryRoute: "/places/",
  },
  events: {
    category: "core",
    summary:
      "35 dated turning points and geolocated battles with coordinates, summaries, and confidence qualifiers.",
    primaryRoute: "/chronology#",
  },
  historical_items: {
    category: "core",
    summary:
      "Primary inscriptions and material evidence with physical medium, script, language, catalogue number, and historical claim.",
    primaryRoute: "/evidence/",
  },
  item_text_lines: {
    category: "core",
    summary:
      "Line-by-line English translations read from published epigraphical volumes for each historical item.",
  },
  sources: {
    category: "core",
    summary:
      "209 cited works, epigraphical volumes, datasets, and encyclopaedic references with full citation, URL, and licence.",
  },
  images: {
    category: "core",
    summary:
      "1,026 credited photographs, coins, manuscripts, and architectural views with creator, licence, source page, and descriptive alt text.",
  },
  kingdom_borders: {
    category: "spatial",
    summary:
      "466 dated PostGIS MultiPolygon territory shapes, uncertain frontier lines, and map label anchor points from Cliopatria.",
  },
  routes: {
    category: "spatial",
    summary:
      "PostGIS LineString maritime and overland corridors active during specific historical windows.",
  },
  kingdom_capitals: {
    category: "relations",
    summary:
      "Links each kingdom to its capital city or cities in the places table, preserving capital sequence and historical name as recorded.",
  },
  event_kingdoms: {
    category: "relations",
    summary:
      "Connects turning points and battles to participating or territory-holding kingdoms.",
  },
  event_places: {
    category: "relations",
    summary: "Links historical events to the specific places where they occurred.",
  },
  route_kingdoms: {
    category: "relations",
    summary:
      "Connects trade and maritime routes to the kingdoms that maintained or sailed them.",
  },
  item_kingdoms: {
    category: "relations",
    summary: "Links inscriptions and material artifacts to the kingdoms they attest.",
  },
  other_names: {
    category: "relations",
    summary:
      "Native-script names (Tamil, Devanagari, Kannada, Telugu) and alternate historical spellings for kingdoms, people, and places.",
  },
  information_sources: {
    category: "relations",
    summary:
      "1,798 provenance links connecting every kingdom, person, place, event, border, route, and inscription to its cited source.",
  },
};

export const categoryLabels: Record<TableCategory, { title: string; subtitle: string }> = {
  core: {
    title: "Core historical records",
    subtitle: "Primary entities, primary sources, and media assets",
  },
  spatial: {
    title: "PostGIS geography layers",
    subtitle: "Dated territory polygons, frontier lines, and trade corridors",
  },
  relations: {
    title: "Relational bridges & provenance",
    subtitle: "Foreign-key join tables, native-script names, and source citations",
  },
};

export type ConnectionLink = {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
};

export type TableColumnInfo = {
  table_name: string;
  column_name: string;
  type: string;
  nullable: boolean;
  is_primary: boolean;
};
