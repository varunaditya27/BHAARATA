ALTER TABLE event_kingdoms DROP CONSTRAINT event_kingdoms_connection_check;
ALTER TABLE event_kingdoms ADD CONSTRAINT event_kingdoms_connection_check CHECK (connection IN ('inside_borders', 'fought_in', 'related'));
UPDATE event_kingdoms SET connection = 'related'
FROM events WHERE event_kingdoms.event_id = events.id AND events.category = 'major_event' AND event_kingdoms.connection = 'inside_borders';
