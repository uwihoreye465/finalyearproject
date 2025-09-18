-- Quick Fix for Evidence JSON Error
-- Run this if you're getting the "invalid input syntax for type json" error

-- Step 1: Check what data is causing the issue
SELECT 
  vic_id, 
  evidence,
  CASE 
    WHEN evidence ~ '^\{.*\}$' THEN 'Valid JSON'
    ELSE 'Invalid JSON - needs conversion'
  END as status
FROM victim 
WHERE evidence IS NOT NULL 
AND evidence !~ '^\{.*\}$'
LIMIT 10;

-- Step 2: Convert problematic text to proper JSON format
UPDATE victim 
SET evidence = json_build_object(
  'description', evidence,
  'files', '[]'::json,
  'uploadedAt', NOW()::text
)::text
WHERE evidence IS NOT NULL 
AND evidence !~ '^\{.*\}$';

-- Step 3: Now try the column type conversion
ALTER TABLE victim 
ALTER COLUMN evidence TYPE JSONB USING evidence::JSONB;

-- Step 4: Add index
CREATE INDEX IF NOT EXISTS idx_victim_evidence ON victim USING GIN (evidence);

-- Step 5: Verify the fix
SELECT 
  vic_id, 
  evidence,
  jsonb_typeof(evidence) as evidence_type
FROM victim 
WHERE evidence IS NOT NULL 
LIMIT 5;
