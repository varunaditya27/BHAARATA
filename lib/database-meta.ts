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
      "392 places on the map—capitals, temples, forts, mosques, tombs, monasteries, and protected monuments—with their coordinates.",
    primaryRoute: "/places/",
  },
  events: {
    category: "core",
    summary:
      "35 dated turning points and battles with map coordinates, summaries, and how sure we are of the dates.",
    primaryRoute: "/chronology#",
  },
  historical_items: {
    category: "core",
    summary:
      "Inscriptions and objects, with what they are made of, their script, language, and what they tell us.",
    primaryRoute: "/evidence/",
  },
  item_text_lines: {
    category: "core",
    summary:
      "Line-by-line English translations read from printed books for each inscription.",
  },
  sources: {
    category: "core",
    summary:
      "209 books, inscription volumes, datasets, and articles with full citations and web links.",
  },
  images: {
    category: "core",
    summary:
      "1,026 credited photos, coins, manuscripts, and building views with creator, licence, and description.",
  },
  kingdom_borders: {
    category: "spatial",
    summary:
      "466 dated kingdom border shapes, uncertain frontier lines, and map label spots from Cliopatria.",
  },
  routes: {
    category: "spatial",
    summary:
      "Sea and land trade routes drawn on the map for the years they were active.",
  },
  kingdom_capitals: {
    category: "relations",
    summary:
      "Connects each kingdom to its capital city or cities, in order.",
  },
  event_kingdoms: {
    category: "relations",
    summary:
      "Connects turning points and battles to the kingdoms involved.",
  },
  event_places: {
    category: "relations",
    summary: "Links battles and events to the places where they happened.",
  },
  route_kingdoms: {
    category: "relations",
    summary:
      "Connects trade and sea routes to the kingdoms that used them.",
  },
  item_kingdoms: {
    category: "relations",
    summary: "Links inscriptions and objects to the kingdoms they mention.",
  },
  other_names: {
    category: "relations",
    summary:
      "Local-script names (Tamil, Devanagari, Kannada, Telugu) and alternate spellings for kingdoms, people, and places.",
  },
  information_sources: {
    category: "relations",
    summary:
      "1,798 source links showing where each fact about a kingdom, ruler, place, battle, or border came from.",
  },
};

export const categoryLabels: Record<TableCategory, { title: string; subtitle: string }> = {
  core: {
    title: "Main records",
    subtitle: "Kingdoms, people, places, battles, inscriptions, sources, and photos",
  },
  spatial: {
    title: "Map shapes",
    subtitle: "Dated kingdom borders, frontier lines, and trade routes",
  },
  relations: {
    title: "Links & names",
    subtitle: "Connections between lists, local-script names, and source citations",
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
