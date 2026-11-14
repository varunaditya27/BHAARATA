UPDATE places SET date_confidence = 'unknown' WHERE start_year IS NULL AND end_year IS NULL;
UPDATE kingdom_capitals SET date_confidence = 'unknown' WHERE from_year IS NULL AND to_year IS NULL;
