-- Match names already used by the atlas to their existing place records.
INSERT INTO kingdom_capitals (kingdom_id, place_id, date_confidence)
SELECT pair.kingdom_id, pair.place_id, 'unknown'::date_confidence
FROM (VALUES ('hoysala', 'dorasamudra'), ('pala', 'pataliputra'), ('bahmani', 'gulbarga')) AS pair(kingdom_id, place_id)
JOIN kingdoms ON kingdoms.id = pair.kingdom_id
JOIN places ON places.id = pair.place_id
WHERE NOT EXISTS (SELECT 1 FROM kingdom_capitals WHERE kingdom_id = pair.kingdom_id AND place_id = pair.place_id);
