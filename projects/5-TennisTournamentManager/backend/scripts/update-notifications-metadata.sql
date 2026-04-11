-- Update existing notifications to add tournament metadata for testing
-- This allows old notifications to display tournament badges

UPDATE notifications
SET metadata = jsonb_build_object(
  'tournamentId', 'trn_test789',
  'tournamentName', 'Spring Championship'
)
WHERE metadata IS NULL OR metadata::text = 'null';

-- Display the updated notifications
SELECT id, title, type, metadata
FROM notifications
ORDER BY "createdAt" DESC
LIMIT 5;
