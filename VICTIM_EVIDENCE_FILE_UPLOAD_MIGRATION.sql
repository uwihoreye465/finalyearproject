-- Migration to support file uploads for victim evidence
-- Run this SQL in your Supabase SQL Editor

-- Update the evidence column to support JSON data (files + description)
-- First, let's check the current column type
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'victim' 
AND column_name = 'evidence';

-- If the column is currently TEXT, we need to change it to JSONB
-- This will allow us to store structured data with files and descriptions
ALTER TABLE victim 
ALTER COLUMN evidence TYPE JSONB USING evidence::JSONB;

-- Add an index for better performance on JSON queries
CREATE INDEX IF NOT EXISTS idx_victim_evidence ON victim USING GIN (evidence);

-- Add a comment to document the new structure
COMMENT ON COLUMN victim.evidence IS 'JSON object containing evidence files and description: {"description": "text", "files": [{"filename": "file.jpg", "originalName": "photo.jpg", "fileSize": 12345, "fileType": "image/jpeg", "fileUrl": "http://...", "uploadedAt": "2024-01-01T00:00:00Z"}]}';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'victim' 
AND column_name = 'evidence';

-- Test query to see the new structure
SELECT vic_id, evidence 
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 5;
