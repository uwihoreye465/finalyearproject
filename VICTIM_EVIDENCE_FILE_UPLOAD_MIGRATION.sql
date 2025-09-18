-- Migration to support file uploads for victim evidence
-- Run this SQL in your Supabase SQL Editor

-- Update the evidence column to support JSON data (files + description)
-- First, let's check the current column type
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'victim' 
AND column_name = 'evidence';

-- Check existing data to see what we're working with
SELECT vic_id, evidence, LENGTH(evidence) as evidence_length
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 10;

-- Step 1: Create a backup column to preserve existing data
ALTER TABLE victim ADD COLUMN evidence_backup TEXT;
UPDATE victim SET evidence_backup = evidence WHERE evidence IS NOT NULL;

-- Step 2: Convert existing text evidence to proper JSON format
-- This handles cases where evidence is just plain text
UPDATE victim 
SET evidence = CASE 
  WHEN evidence IS NULL THEN NULL
  WHEN evidence = '' THEN NULL
  WHEN evidence ~ '^\{.*\}$' THEN evidence::JSONB  -- Already JSON
  ELSE json_build_object(
    'description', evidence,
    'files', '[]'::json,
    'uploadedAt', NOW()::text
  )::text
END
WHERE evidence IS NOT NULL;

-- Step 3: Now convert the column type to JSONB
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
