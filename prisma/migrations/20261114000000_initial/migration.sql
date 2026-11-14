CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE public.certainty_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.date_confidence AS ENUM ('recorded', 'likely', 'debated', 'example', 'unknown');
CREATE TYPE public.date_type AS ENUM ('exact', 'about', 'before', 'after', 'unknown');
CREATE TYPE public.map_confidence AS ENUM ('high', 'medium', 'low', 'example');
CREATE TYPE public.person_date_type AS ENUM ('time_as_ruler', 'life');







CREATE TABLE public.event_kingdoms (
    event_id text NOT NULL,
    kingdom_id text NOT NULL,
    connection text NOT NULL,
    CONSTRAINT event_kingdoms_connection_check CHECK ((connection = ANY (ARRAY['inside_borders'::text, 'fought_in'::text, 'related'::text])))
);



CREATE TABLE public.event_places (
    event_id text NOT NULL,
    place_id text NOT NULL
);



CREATE TABLE public.events (
    id text NOT NULL,
    page_name text NOT NULL,
    title text NOT NULL,
    category text,
    summary text NOT NULL,
    map_point public.geometry(Point,4326),
    start_year integer,
    end_year integer,
    start_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    end_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    date_confidence public.date_confidence NOT NULL,
    CONSTRAINT events_category_check CHECK ((category = ANY (ARRAY['major_event'::text, 'battle'::text]))),
    CONSTRAINT events_check CHECK (((start_year IS NULL) OR (end_year IS NULL) OR (start_year <= end_year))),
    CONSTRAINT events_check1 CHECK (((start_year IS NOT NULL) OR (start_date_type = 'unknown'::public.date_type))),
    CONSTRAINT events_check2 CHECK (((end_year IS NOT NULL) OR (end_date_type = 'unknown'::public.date_type)))
);



CREATE TABLE public.historical_items (
    id text NOT NULL,
    page_name text NOT NULL,
    title text NOT NULL,
    item_type text NOT NULL,
    material text,
    script text,
    language text,
    place_id text,
    book_number text,
    image_id text,
    image_is_example boolean DEFAULT false NOT NULL,
    text_is_example boolean DEFAULT false NOT NULL,
    start_year integer,
    start_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    date_confidence public.date_confidence NOT NULL,
    statement text NOT NULL,
    what_it_means text,
    date_doubt public.certainty_level,
    place_doubt public.certainty_level,
    meaning_doubt public.certainty_level,
    statement_is_example boolean DEFAULT false NOT NULL,
    CONSTRAINT historical_items_check1 CHECK (((start_year IS NOT NULL) OR (start_date_type = 'unknown'::public.date_type)))
);



CREATE TABLE public.images (
    id text NOT NULL,
    file_path_or_url text NOT NULL,
    title text,
    image_creator text,
    licence text NOT NULL,
    source_url text,
    alt_text text
);



CREATE TABLE public.information_sources (
    id bigint NOT NULL,
    source_id text NOT NULL,
    note text,
    kingdom_id text,
    person_id text,
    place_id text,
    event_id text,
    border_id text,
    route_id text,
    item_id text,
    CONSTRAINT information_sources_check CHECK ((num_nonnulls(kingdom_id, person_id, place_id, event_id, border_id, route_id, item_id) = 1))
);



ALTER TABLE public.information_sources ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.information_sources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.item_kingdoms (
    item_id text NOT NULL,
    kingdom_id text NOT NULL
);



CREATE TABLE public.item_text_lines (
    id bigint NOT NULL,
    item_id text NOT NULL,
    line_number integer NOT NULL,
    english_words text,
    CONSTRAINT item_text_lines_line_number_check CHECK ((line_number > 0))
);



ALTER TABLE public.item_text_lines ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.item_text_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.kingdom_borders (
    id text NOT NULL,
    kingdom_id text NOT NULL,
    from_year integer NOT NULL,
    to_year integer NOT NULL,
    outline public.geometry(MultiPolygon,4326) NOT NULL,
    uncertain_edge public.geometry(MultiPolygon,4326),
    label_point public.geometry(Point,4326),
    confidence public.map_confidence NOT NULL,
    is_default boolean DEFAULT true NOT NULL,
    CONSTRAINT kingdom_borders_check CHECK ((from_year <= to_year)),
    CONSTRAINT kingdom_borders_outline_valid_check CHECK (public.st_isvalid(outline)),
    CONSTRAINT kingdom_borders_uncertain_edge_check CHECK (((uncertain_edge IS NULL) OR public.st_isvalid(uncertain_edge)))
);



CREATE TABLE public.kingdom_capitals (
    id bigint NOT NULL,
    kingdom_id text NOT NULL,
    place_id text NOT NULL,
    name_as_recorded text,
    display_order integer
);



ALTER TABLE public.kingdom_capitals ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kingdom_capitals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.kingdoms (
    id text NOT NULL,
    page_name text NOT NULL,
    name text NOT NULL,
    kingdom_type text NOT NULL,
    region text NOT NULL,
    language text,
    religion text,
    notable_for text,
    summary text NOT NULL,
    quote text,
    accent_color text NOT NULL,
    main_image_id text,
    start_year integer,
    end_year integer,
    start_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    end_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    date_confidence public.date_confidence NOT NULL,
    display_order integer,
    CONSTRAINT kingdoms_check CHECK (((start_year IS NULL) OR ((start_year >= 200) AND (start_year <= 1900) AND ((end_year IS NULL) OR (end_year >= start_year))))),
    CONSTRAINT kingdoms_check1 CHECK (((start_year IS NOT NULL) OR (start_date_type = 'unknown'::public.date_type))),
    CONSTRAINT kingdoms_check2 CHECK (((end_year IS NOT NULL) OR (end_date_type = 'unknown'::public.date_type)))
);



CREATE TABLE public.other_names (
    id bigint NOT NULL,
    kingdom_id text,
    person_id text,
    place_id text,
    name_text text NOT NULL,
    language_code text,
    name_kind text,
    CONSTRAINT other_names_check CHECK ((num_nonnulls(kingdom_id, person_id, place_id) = 1))
);



ALTER TABLE public.other_names ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.other_names_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.people (
    id text NOT NULL,
    page_name text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    kingdom_id text,
    date_kind public.person_date_type,
    summary text,
    portrait_id text,
    start_year integer,
    end_year integer,
    start_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    end_date_type public.date_type DEFAULT 'unknown'::public.date_type NOT NULL,
    date_confidence public.date_confidence NOT NULL,
    CONSTRAINT people_check CHECK (((start_year IS NULL) OR (end_year IS NULL) OR (start_year <= end_year))),
    CONSTRAINT people_check1 CHECK (((start_year IS NOT NULL) OR (start_date_type = 'unknown'::public.date_type))),
    CONSTRAINT people_check2 CHECK (((end_year IS NOT NULL) OR (end_date_type = 'unknown'::public.date_type)))
);



CREATE TABLE public.places (
    id text NOT NULL,
    page_name text,
    name text NOT NULL,
    place_kind text NOT NULL,
    region text,
    map_point public.geometry(Point,4326) NOT NULL,
    protected_place boolean DEFAULT false NOT NULL,
    main_image_id text,
    start_year integer,
    map_properties jsonb
);



CREATE TABLE public.route_kingdoms (
    route_id text NOT NULL,
    kingdom_id text NOT NULL
);



CREATE TABLE public.routes (
    id text NOT NULL,
    label text NOT NULL,
    route_type text NOT NULL,
    from_year integer NOT NULL,
    to_year integer NOT NULL,
    map_path public.geometry(LineString,4326) NOT NULL,
    confidence public.map_confidence NOT NULL,
    CONSTRAINT routes_check CHECK ((from_year <= to_year)),
    CONSTRAINT routes_route_type_check CHECK ((route_type = ANY (ARRAY['trade'::text, 'military'::text, 'sea'::text])))
);



CREATE TABLE public.sources (
    id text NOT NULL,
    title text NOT NULL,
    source_type text NOT NULL,
    source_details text NOT NULL,
    url text,
    licence text
);



ALTER TABLE ONLY public.event_kingdoms
    ADD CONSTRAINT event_kingdoms_pkey PRIMARY KEY (event_id, kingdom_id, connection);



ALTER TABLE ONLY public.event_places
    ADD CONSTRAINT event_places_pkey PRIMARY KEY (event_id, place_id);



ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_page_name_key UNIQUE (page_name);



ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.historical_items
    ADD CONSTRAINT historical_items_page_name_key UNIQUE (page_name);



ALTER TABLE ONLY public.historical_items
    ADD CONSTRAINT historical_items_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.item_kingdoms
    ADD CONSTRAINT item_kingdoms_pkey PRIMARY KEY (item_id, kingdom_id);



ALTER TABLE ONLY public.item_text_lines
    ADD CONSTRAINT item_text_lines_item_id_line_number_key UNIQUE (item_id, line_number);



ALTER TABLE ONLY public.item_text_lines
    ADD CONSTRAINT item_text_lines_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.kingdom_borders
    ADD CONSTRAINT kingdom_borders_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.kingdom_capitals
    ADD CONSTRAINT kingdom_capitals_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.kingdoms
    ADD CONSTRAINT kingdoms_page_name_key UNIQUE (page_name);



ALTER TABLE ONLY public.kingdoms
    ADD CONSTRAINT kingdoms_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.other_names
    ADD CONSTRAINT other_names_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_page_name_key UNIQUE (page_name);



ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_page_name_key UNIQUE (page_name);



ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.route_kingdoms
    ADD CONSTRAINT route_kingdoms_pkey PRIMARY KEY (route_id, kingdom_id);



ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_pkey PRIMARY KEY (id);



CREATE INDEX boundaries_geom_idx ON public.kingdom_borders USING gist (outline);



CREATE INDEX boundaries_year_idx ON public.kingdom_borders USING btree (from_year, to_year);



CREATE INDEX events_geom_idx ON public.events USING gist (map_point);



CREATE INDEX events_year_idx ON public.events USING btree (start_year, end_year);



CREATE INDEX info_sources_border_idx ON public.information_sources USING btree (border_id) WHERE (border_id IS NOT NULL);



CREATE INDEX info_sources_event_idx ON public.information_sources USING btree (event_id) WHERE (event_id IS NOT NULL);



CREATE INDEX info_sources_kingdom_idx ON public.information_sources USING btree (kingdom_id) WHERE (kingdom_id IS NOT NULL);



CREATE INDEX info_sources_person_idx ON public.information_sources USING btree (person_id) WHERE (person_id IS NOT NULL);



CREATE INDEX info_sources_place_idx ON public.information_sources USING btree (place_id) WHERE (place_id IS NOT NULL);



CREATE UNIQUE INDEX kingdom_capitals_kingdom_id_place_id_key ON public.kingdom_capitals USING btree (kingdom_id, place_id);



CREATE INDEX other_names_kingdom_idx ON public.other_names USING btree (kingdom_id) WHERE (kingdom_id IS NOT NULL);



CREATE INDEX other_names_person_idx ON public.other_names USING btree (person_id) WHERE (person_id IS NOT NULL);



CREATE INDEX other_names_place_idx ON public.other_names USING btree (place_id) WHERE (place_id IS NOT NULL);



CREATE INDEX people_polity_idx ON public.people USING btree (kingdom_id);



CREATE INDEX places_geom_idx ON public.places USING gist (map_point);



CREATE INDEX record_sources_source_idx ON public.information_sources USING btree (source_id);



CREATE INDEX routes_geom_idx ON public.routes USING gist (map_path);



ALTER TABLE ONLY public.event_kingdoms
    ADD CONSTRAINT event_kingdoms_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);



ALTER TABLE ONLY public.event_kingdoms
    ADD CONSTRAINT event_kingdoms_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.event_places
    ADD CONSTRAINT event_places_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);



ALTER TABLE ONLY public.event_places
    ADD CONSTRAINT event_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id);



ALTER TABLE ONLY public.historical_items
    ADD CONSTRAINT historical_items_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.images(id);



ALTER TABLE ONLY public.historical_items
    ADD CONSTRAINT historical_items_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_border_id_fkey FOREIGN KEY (border_id) REFERENCES public.kingdom_borders(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.historical_items(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);



ALTER TABLE ONLY public.information_sources
    ADD CONSTRAINT information_sources_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(id);



ALTER TABLE ONLY public.item_kingdoms
    ADD CONSTRAINT item_kingdoms_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.historical_items(id);



ALTER TABLE ONLY public.item_kingdoms
    ADD CONSTRAINT item_kingdoms_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.item_text_lines
    ADD CONSTRAINT item_text_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.historical_items(id);



ALTER TABLE ONLY public.kingdom_borders
    ADD CONSTRAINT kingdom_borders_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.kingdom_capitals
    ADD CONSTRAINT kingdom_capitals_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.kingdom_capitals
    ADD CONSTRAINT kingdom_capitals_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id);



ALTER TABLE ONLY public.kingdoms
    ADD CONSTRAINT kingdoms_main_image_id_fkey FOREIGN KEY (main_image_id) REFERENCES public.images(id);



ALTER TABLE ONLY public.other_names
    ADD CONSTRAINT other_names_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.other_names
    ADD CONSTRAINT other_names_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);



ALTER TABLE ONLY public.other_names
    ADD CONSTRAINT other_names_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id);



ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_portrait_id_fkey FOREIGN KEY (portrait_id) REFERENCES public.images(id);



ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_main_image_id_fkey FOREIGN KEY (main_image_id) REFERENCES public.images(id);



ALTER TABLE ONLY public.route_kingdoms
    ADD CONSTRAINT route_kingdoms_kingdom_id_fkey FOREIGN KEY (kingdom_id) REFERENCES public.kingdoms(id);



ALTER TABLE ONLY public.route_kingdoms
    ADD CONSTRAINT route_kingdoms_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id);




