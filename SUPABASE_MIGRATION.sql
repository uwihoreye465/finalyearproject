-- Run this SQL in your Supabase SQL Editor
-- This adds GPS tracking columns to the notification table

-- Add GPS tracking columns
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) NULL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) NULL,
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255) NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_notification_location ON notification(latitude, longitude);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notification' 
AND column_name IN ('latitude', 'longitude', 'location_name');
