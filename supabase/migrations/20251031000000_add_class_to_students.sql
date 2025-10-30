/*
  # Add Class Field to Students Table

  ## Changes
  - Add `class` column to students table to store student's class (1-10)
  - Class is mandatory (NOT NULL)
  - Update existing records with a default value if any exist
*/

-- Add class column to students table
ALTER TABLE students 
ADD COLUMN class text NOT NULL DEFAULT '1';

-- Remove the default after adding the column (so future inserts must specify class)
ALTER TABLE students 
ALTER COLUMN class DROP DEFAULT;

-- Add a check constraint to ensure class is one of the valid values
ALTER TABLE students
ADD CONSTRAINT students_class_check 
CHECK (class IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10'));

-- Create an index on class for better query performance
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
