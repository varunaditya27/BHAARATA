-- Existing source shapes include invalid polygons; preserve them until reviewed.
ALTER TABLE kingdom_borders DROP CONSTRAINT kingdom_borders_outline_check;
