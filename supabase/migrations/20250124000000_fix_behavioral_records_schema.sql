/*
  # Fix Student Behavioral Records Schema Conflict
  
  This migration fixes the schema conflict between the two previous migrations:
  - 20250122000001_student_profile_enhancement.sql (uses incident_type)
  - 20250123000000_student_profile_module.sql (uses record_type)
  
  We'll standardize on 'incident_type' to match the TypeScript types.
*/

-- First, check if the table exists and what columns it has
DO $$
BEGIN
  -- Add incident_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'incident_type'
  ) THEN
    -- Add the incident_type column
    ALTER TABLE student_behavioral_records 
    ADD COLUMN incident_type text;
    
    -- Copy data from record_type to incident_type if record_type exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'student_behavioral_records' 
      AND column_name = 'record_type'
    ) THEN
      UPDATE student_behavioral_records 
      SET incident_type = record_type;
    END IF;
    
    -- Add the constraint for incident_type
    ALTER TABLE student_behavioral_records 
    ADD CONSTRAINT student_behavioral_records_incident_type_check 
    CHECK (incident_type IN ('disciplinary', 'achievement', 'observation', 'warning', 'suspension', 'commendation'));
    
    -- Make incident_type NOT NULL
    ALTER TABLE student_behavioral_records 
    ALTER COLUMN incident_type SET NOT NULL;
  END IF;
  
  -- Drop record_type column if it exists and incident_type is populated
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'record_type'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'incident_type'
  ) THEN
    -- Drop the old constraint first
    ALTER TABLE student_behavioral_records 
    DROP CONSTRAINT IF EXISTS student_behavioral_records_record_type_check;
    
    -- Drop the record_type column
    ALTER TABLE student_behavioral_records 
    DROP COLUMN IF EXISTS record_type;
  END IF;
END $$;

-- Ensure the index exists for incident_type
DROP INDEX IF EXISTS idx_student_behavioral_records_type;
CREATE INDEX IF NOT EXISTS idx_behavioral_records_incident_type ON student_behavioral_records(incident_type);

-- Update any existing indexes that might reference the old column
DROP INDEX IF EXISTS idx_student_behavioral_records_record_type;

-- Ensure the table has all required columns with correct constraints
DO $$
BEGIN
  -- Ensure category column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE student_behavioral_records 
    ADD COLUMN category text;
  END IF;
  
  -- Ensure title column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'title'
    AND is_nullable = 'YES'
  ) THEN
    -- Update any NULL titles with a default value
    UPDATE student_behavioral_records 
    SET title = 'Behavioral Record' 
    WHERE title IS NULL;
    
    ALTER TABLE student_behavioral_records 
    ALTER COLUMN title SET NOT NULL;
  END IF;
  
  -- Ensure description column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_behavioral_records' 
    AND column_name = 'description'
    AND is_nullable = 'YES'
  ) THEN
    -- Update any NULL descriptions with a default value
    UPDATE student_behavioral_records 
    SET description = 'No description provided' 
    WHERE description IS NULL;
    
    ALTER TABLE student_behavioral_records 
    ALTER COLUMN description SET NOT NULL;
  END IF;
END $$;

-- Add a comment to document the schema
COMMENT ON TABLE student_behavioral_records IS 'Student behavioral records tracking incidents, achievements, and observations';
COMMENT ON COLUMN student_behavioral_records.incident_type IS 'Type of behavioral incident or record';
COMMENT ON COLUMN student_behavioral_records.category IS 'Category classification for the behavioral record';