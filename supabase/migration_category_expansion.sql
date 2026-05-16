ALTER TABLE clubs
DROP CONSTRAINT IF EXISTS clubs_category_check;

ALTER TABLE clubs
ADD CONSTRAINT clubs_category_check
CHECK (category IN (
    'academic',
    'sports',
    'cultural',
    'community',
    'arts',
    'technology',
    'health',
    'volunteer',
    'career'
));

ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_category_check;

ALTER TABLE events
ADD CONSTRAINT events_category_check
CHECK (category IN (
    'academic',
    'sports',
    'cultural',
    'community',
    'arts',
    'technology',
    'health',
    'volunteer',
    'career'
));
