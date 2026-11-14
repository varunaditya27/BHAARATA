-- Correct links created by the original import; these records say only “related”.
UPDATE event_kingdoms link SET connection='related'
FROM events event,
  (VALUES
    ('rajaraja-conquests','chola'),
    ('gangaikondacholapuram-founding','chola'),
    ('talikota','vijayanagara'),
    ('kailasa-temple-construction','rashtrakuta'),
    ('chennakeshava-temple-consecration','hoysala'),
    ('rajaraja-anuradhapura','chola'),
    ('kannauj-taken','pratihara'),
    ('kannauj-taken','pala'),
    ('kannauj-taken','rashtrakuta'),
    ('delhi-sultanate-founded','delhi-sultanate'),
    ('bahmani-founded','bahmani')
  ) AS original(event_id, kingdom_id)
WHERE link.event_id=original.event_id AND link.kingdom_id=original.kingdom_id
  AND event.id=link.event_id AND (event.category IS NULL OR event.category='major_event')
  AND link.connection='inside_borders'
  AND NOT EXISTS (SELECT 1 FROM event_kingdoms existing WHERE existing.event_id=link.event_id AND existing.kingdom_id=link.kingdom_id AND existing.connection='related');
