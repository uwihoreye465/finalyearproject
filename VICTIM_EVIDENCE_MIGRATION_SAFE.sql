-- SAFE Migration for Victim Evidence File Upload
-- This script handles existing data safely

-- Step 1: Check current data
SELECT 
  vic_id, 
  evidence, 
  LENGTH(evidence) as evidence_length,
  CASE 
    WHEN evidence IS NULL THEN 'NULL'
    WHEN evidence = '' THEN 'EMPTY'
    WHEN evidence ~ '^\{.*\}$' THEN 'JSON'
    ELSE 'TEXT'
  END as data_type
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 10;

-- Step 2: Create backup table
CREATE TABLE IF NOT EXISTS victim_evidence_backup AS 
SELECT vic_id, evidence, created_at 
FROM victim 
WHERE evidence IS NOT NULL;

-- Step 3: Add new JSONB column
ALTER TABLE victim ADD COLUMN evidence_new JSONB;

-- Step 4: Convert existing data to JSON format
UPDATE victim 
SET evidence_new = CASE 
  WHEN evidence IS NULL THEN NULL
  WHEN evidence = '' THEN NULL
  WHEN evidence ~ '^\{.*\}$' THEN evidence::JSONB  -- Already JSON
  ELSE json_build_object(
    'description', evidence,
    'files', '[]'::json,
    'uploadedAt', NOW()::text
  )::JSONB
END
WHERE evidence IS NOT NULL;

-- Step 5: Drop old column and rename new one
ALTER TABLE victim DROP COLUMN evidence;
ALTER TABLE victim RENAME COLUMN evidence_new TO evidence;

-- Step 6: Add index
CREATE INDEX IF NOT EXISTS idx_victim_evidence ON victim USING GIN (evidence);

-- Step 7: Verify the migration
SELECT 
  vic_id, 
  evidence,
  jsonb_typeof(evidence) as evidence_type
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 5;

-- Step 8: Clean up backup table (optional - run after verifying data)
-- DROP TABLE victim_evidence_backup;
