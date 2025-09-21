-- Fix image_url column in criminals_arrested table
-- Change from bytea (binary data) to VARCHAR (text) to store file paths

-- First, add a new column with the correct data type
ALTER TABLE criminals_arrested 
ADD COLUMN image_path VARCHAR(500);

-- Copy any existing data from image_url to image_path (if any valid paths exist)
-- This will only work if the image_url contains actual file paths, not blob data
UPDATE criminals_arrested 
SET image_path = image_url::text 
WHERE image_url IS NOT NULL 
  AND image_url::text LIKE '/uploads/%';

-- Drop the old image_url column
ALTER TABLE criminals_arrested 
DROP COLUMN image_url;

-- Rename the new column to image_url
ALTER TABLE criminals_arrested 
RENAME COLUMN image_path TO image_url;

-- Add a comment to clarify the column purpose
COMMENT ON COLUMN criminals_arrested.image_url IS 'File path to the arrested person image (e.g., /uploads/arrested/images/filename.jpg)';

-- Optional: Add a check constraint to ensure the path starts with /uploads/
ALTER TABLE criminals_arrested 
ADD CONSTRAINT check_image_url_format 
CHECK (image_url IS NULL OR image_url LIKE '/uploads/%');
