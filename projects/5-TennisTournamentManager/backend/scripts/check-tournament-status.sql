-- Check tournament status for category cat_5fcb7fbd
SELECT 
    t.id as tournament_id,
    t.name as tournament_name,
    t.status as tournament_status,
    t."registrationCloseDate",
    c.id as category_id,
    c.name as category_name,
    c."maxParticipants"
FROM tournaments t
JOIN categories c ON c."tournamentId" = t.id
WHERE c.id = 'cat_5fcb7fbd';

-- If tournament status is not REGISTRATION_OPEN, update it
UPDATE tournaments
SET status = 'REGISTRATION_OPEN'
WHERE id IN (
    SELECT t.id 
    FROM tournaments t
    JOIN categories c ON c."tournamentId" = t.id
    WHERE c.id = 'cat_5fcb7fbd'
    AND t.status != 'REGISTRATION_OPEN'
);

-- Verify the update
SELECT 
    t.id,
    t.name,
    t.status
FROM tournaments t
JOIN categories c ON c."tournamentId" = t.id
WHERE c.id = 'cat_5fcb7fbd';
