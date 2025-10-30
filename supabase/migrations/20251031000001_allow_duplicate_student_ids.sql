/*
  # Allow Duplicate Student IDs (Roll Numbers)

  ## Changes
  - Drop the unique constraint on students.student_id column
  - Drop the unique index on students.student_id column
  - This allows multiple students to have the same roll number
*/

-- Drop the unique constraint on student_id
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_student_id_key;

-- Drop the unique index on student_id (if it exists separately)
DROP INDEX IF EXISTS students_student_id_key;
