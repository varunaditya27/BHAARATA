-- Proposed BHĀRATA schema. Run in an empty PostgreSQL database with PostGIS installed.
-- This does not migrate existing data or connect the application.
BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE date_type AS ENUM ('exact', 'about', 'before', 'after', 'unknown');
CREATE TYPE date_confidence AS ENUM ('recorded', 'likely', 'debated', 'example');
CREATE TYPE map_confidence AS ENUM ('high', 'medium', 'low', 'example');
CREATE TYPE certainty_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE person_date_type AS ENUM ('time_as_ruler', 'life');

CREATE TABLE sources (
  id text PRIMARY KEY,
  title text NOT NULL,
  source_type text NOT NULL,
  source_details text NOT NULL,
  url text,
  licence text
);

CREATE TABLE images (
  id text PRIMARY KEY,
  file_path_or_url text NOT NULL,
  title text,
  image_creator text,
  licence text NOT NULL,
  licence_url text,
  source_url text
);

CREATE TABLE kingdoms (
  id text PRIMARY KEY,
  page_name text NOT NULL UNIQUE,
  name text NOT NULL,
  kingdom_type text NOT NULL,
  region text NOT NULL,
  language text,
  religion text,
  notable_for text,
  summary text NOT NULL,
  quote text,
  accent_color text NOT NULL,
  main_image_id text REFERENCES images(id),
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE people (
  id text PRIMARY KEY,
  page_name text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  kingdom_id text REFERENCES kingdoms(id),
  date_kind person_date_type,
  summary text,
  portrait_id text REFERENCES images(id),
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE places (
  id text PRIMARY KEY,
  page_name text UNIQUE,
  name text NOT NULL,
  place_kind text NOT NULL,
  region text,
  map_point geometry(Point,4326) NOT NULL,
  protected_place boolean NOT NULL DEFAULT false,
  main_image_id text REFERENCES images(id),
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE events (
  id text PRIMARY KEY,
  page_name text NOT NULL UNIQUE,
  title text NOT NULL,
  category text CHECK (category IN ('major_event','battle')),
  summary text NOT NULL,
  map_point geometry(Point,4326),
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE kingdom_borders (
  id text PRIMARY KEY,
  kingdom_id text NOT NULL REFERENCES kingdoms(id),
  from_year integer NOT NULL,
  to_year integer NOT NULL,
  outline geometry(MultiPolygon,4326) NOT NULL,
  uncertain_edge geometry(MultiPolygon,4326),
  label_point geometry(Point,4326),
  confidence map_confidence NOT NULL,
  border_version text,
  is_default boolean NOT NULL DEFAULT true,
  CHECK (from_year <= to_year),
  CHECK (ST_IsValid(outline)),
  CHECK (uncertain_edge IS NULL OR ST_IsValid(uncertain_edge))
);

CREATE TABLE routes (
  id text PRIMARY KEY,
  label text NOT NULL,
  route_type text NOT NULL CHECK (route_type IN ('trade','military','sea')),
  from_year integer NOT NULL,
  to_year integer NOT NULL,
  map_path geometry(LineString,4326) NOT NULL,
  confidence map_confidence NOT NULL,
  CHECK (from_year <= to_year)
);

CREATE TABLE kingdom_capitals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kingdom_id text NOT NULL REFERENCES kingdoms(id),
  place_id text NOT NULL REFERENCES places(id),
  from_year integer,
  to_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (from_year IS NULL OR to_year IS NULL OR from_year <= to_year),
  CHECK (from_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (to_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE event_kingdoms (
  event_id text NOT NULL REFERENCES events(id),
  kingdom_id text NOT NULL REFERENCES kingdoms(id),
  connection text NOT NULL CHECK (connection IN ('inside_borders','fought_in')),
  PRIMARY KEY (event_id, kingdom_id, connection)
);

CREATE TABLE event_places (
  event_id text NOT NULL REFERENCES events(id),
  place_id text NOT NULL REFERENCES places(id),
  PRIMARY KEY (event_id, place_id)
);

CREATE TABLE route_kingdoms (
  route_id text NOT NULL REFERENCES routes(id),
  kingdom_id text NOT NULL REFERENCES kingdoms(id),
  PRIMARY KEY (route_id, kingdom_id)
);

CREATE TABLE historical_items (
  id text PRIMARY KEY,
  page_name text NOT NULL UNIQUE,
  title text NOT NULL,
  item_type text NOT NULL,
  material text,
  script text,
  language text,
  place_id text REFERENCES places(id),
  book_number text,
  condition text,
  image_id text REFERENCES images(id),
  image_is_example boolean NOT NULL DEFAULT false,
  text_is_example boolean NOT NULL DEFAULT false,
  archive_image_url text,
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE item_kingdoms (
  item_id text NOT NULL REFERENCES historical_items(id),
  kingdom_id text NOT NULL REFERENCES kingdoms(id),
  PRIMARY KEY (item_id, kingdom_id)
);

CREATE TABLE item_text_lines (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id text NOT NULL REFERENCES historical_items(id),
  line_number integer NOT NULL CHECK (line_number > 0),
  original_words text,
  words_in_latin_letters text,
  english_words text,
  box_left numeric,
  box_top numeric,
  box_width numeric,
  box_height numeric,
  UNIQUE (item_id, line_number),
  CHECK (num_nonnulls(box_left, box_top, box_width, box_height) IN (0, 4)),
  CHECK (box_left IS NULL OR (box_left >= 0 AND box_top >= 0 AND box_width > 0 AND box_height > 0 AND box_left + box_width <= 1 AND box_top + box_height <= 1))
);

CREATE TABLE other_names (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kingdom_id text REFERENCES kingdoms(id),
  person_id text REFERENCES people(id),
  place_id text REFERENCES places(id),
  name_text text NOT NULL,
  language_code text,
  name_kind text,
  checked_by_reader boolean NOT NULL DEFAULT false,
  CHECK (num_nonnulls(kingdom_id, person_id, place_id) = 1)
);

CREATE TABLE statements (
  id text PRIMARY KEY,
  kingdom_id text REFERENCES kingdoms(id),
  person_id text REFERENCES people(id),
  place_id text REFERENCES places(id),
  event_id text REFERENCES events(id),
  item_id text REFERENCES historical_items(id),
  statement text NOT NULL,
  what_it_means text,
  is_example boolean NOT NULL DEFAULT false,
  date_doubt certainty_level,
  place_doubt certainty_level,
  meaning_doubt certainty_level,
  CHECK (num_nonnulls(kingdom_id, person_id, place_id, event_id, item_id) = 1),
  start_year integer,
  end_year integer,
  start_date_type date_type NOT NULL DEFAULT 'unknown',
  end_date_type date_type NOT NULL DEFAULT 'unknown',
  date_confidence date_confidence NOT NULL,
  date_notes text,
  CHECK (start_year IS NULL OR end_year IS NULL OR start_year <= end_year),
  CHECK (start_year IS NOT NULL OR start_date_type = 'unknown'),
  CHECK (end_year IS NOT NULL OR end_date_type = 'unknown')
);

CREATE TABLE statement_sources (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  statement_id text NOT NULL REFERENCES statements(id),
  source_id text REFERENCES sources(id),
  item_id text REFERENCES historical_items(id),
  page_or_reference text,
  quoted_text text,
  CHECK (num_nonnulls(source_id, item_id) >= 1)
);

CREATE TABLE disagreements (
  statement_a_id text NOT NULL REFERENCES statements(id),
  statement_b_id text NOT NULL REFERENCES statements(id),
  difference text,
  PRIMARY KEY (statement_a_id, statement_b_id),
  CHECK (statement_a_id < statement_b_id)
);

CREATE TABLE information_sources (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id text NOT NULL REFERENCES sources(id),
  note text,
  kingdom_id text REFERENCES kingdoms(id),
  person_id text REFERENCES people(id),
  place_id text REFERENCES places(id),
  event_id text REFERENCES events(id),
  border_id text REFERENCES kingdom_borders(id),
  route_id text REFERENCES routes(id),
  item_id text REFERENCES historical_items(id),
  capital_id bigint REFERENCES kingdom_capitals(id),
  CHECK (num_nonnulls(kingdom_id, person_id, place_id, event_id, border_id, route_id, item_id, capital_id) = 1)
);

CREATE TABLE event_kingdom_sources (
  event_id text NOT NULL,
  kingdom_id text NOT NULL,
  connection text NOT NULL,
  source_id text NOT NULL REFERENCES sources(id),
  note text,
  PRIMARY KEY (event_id, kingdom_id, connection, source_id),
  FOREIGN KEY (event_id, kingdom_id, connection) REFERENCES event_kingdoms(event_id, kingdom_id, connection)
);

CREATE TABLE suggested_changes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submitted_by text NOT NULL,
  list_to_change text NOT NULL,
  item_to_change text,
  suggested_change jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  review_notes text
);

CREATE INDEX boundaries_geom_idx ON kingdom_borders USING gist (outline);
CREATE INDEX boundaries_year_idx ON kingdom_borders (from_year, to_year);
CREATE INDEX routes_geom_idx ON routes USING gist (map_path);
CREATE INDEX places_geom_idx ON places USING gist (map_point);
CREATE INDEX events_geom_idx ON events USING gist (map_point);
CREATE INDEX events_year_idx ON events (start_year, end_year);
CREATE INDEX people_polity_idx ON people (kingdom_id);
CREATE INDEX record_sources_source_idx ON information_sources (source_id);
CREATE INDEX claim_citations_claim_idx ON statement_sources (statement_id);
COMMIT;
