-- Simple Migration for Victim Evidence File Upload
-- This works with your existing table structure

-- Step 1: Check current evidence data
SELECT 
  vic_id, 
  evidence,
  CASE 
    WHEN evidence IS NULL THEN 'NULL'
    WHEN evidence = '' THEN 'EMPTY'
    WHEN evidence ~ '^\{.*\}$' THEN 'JSON'
    ELSE 'TEXT'
  END as data_type
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 5;

-- Step 2: Convert existing text evidence to JSON format
UPDATE victim 
SET evidence = json_build_object(
  'description', evidence,
  'files', '[]'::json,
  'uploadedAt', NOW()::text
)::text
WHERE evidence IS NOT NULL 
AND evidence !~ '^\{.*\}$';

-- Step 3: Convert column type to JSONB
ALTER TABLE victim 
ALTER COLUMN evidence TYPE JSONB USING evidence::JSONB;

-- Step 4: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_victim_evidence ON victim USING GIN (evidence);

-- Step 5: Verify the migration
SELECT 
  vic_id, 
  evidence,
  jsonb_typeof(evidence) as evidence_type
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 5;
