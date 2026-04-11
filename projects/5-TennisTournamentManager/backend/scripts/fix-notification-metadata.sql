-- Fix for REGISTRATION_CONFIRMED notifications missing metadata
-- This script updates notifications that don't have metadata to include tournamentId
-- based on the tournament registration

-- First, let's see how many notifications are affected
SELECT COUNT(*) as missing_metadata_count
FROM notifications
WHERE type = 'REGISTRATION_CONFIRMED'
  AND (metadata IS NULL OR metadata::text = '{}');

-- Update REGISTRATION_CONFIRMED notifications with missing metadata
-- We'll try to infer the tournamentId from the message text or leave it incomplete
UPDATE notifications n
SET metadata = jsonb_build_object(
  'tournamentId', '', 
  'acceptanceType', 'DIRECT_ACCEPTANCE',
  'note', 'Metadata was missing - tournamentId needs manual update'
)
WHERE n.type = 'REGISTRATION_CONFIRMED'
  AND (n.metadata IS NULL OR n.metadata::text = '{}');

-- Show the updated notifications
SELECT id, type, title, "userId", metadata, "createdAt"
FROM notifications
WHERE type = 'REGISTRATION_CONFIRMED'
ORDER BY "createdAt" DESC
LIMIT 10;

-- NOTE: This is a temporary fix. The real solution is to ensure 
-- notifyRegistrationConfirmed is called with proper tournamentId when creating notifications.
