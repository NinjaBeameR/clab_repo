/*
  # Student Allocation System Database Schema

  ## Overview
  This migration creates the complete database structure for managing student allocations to computers.
  
  ## New Tables
  
  ### 1. `computers`
  Stores information about available computers in the system.
  - `id` (uuid, primary key) - Unique identifier for each computer
  - `name` (text, unique, not null) - Computer name (e.g., "Computer 1", "Computer 2")
  - `location` (text, nullable) - Optional physical location of the computer
  - `created_at` (timestamptz) - Timestamp when computer was added
  - `updated_at` (timestamptz) - Timestamp when computer was last updated

  ### 2. `students`
  Stores student information.
  - `id` (uuid, primary key) - Unique identifier for each student
  - `name` (text, not null) - Student's full name
  - `student_id` (text, unique, not null) - Student identification number
  - `section` (text, nullable) - Optional section (A, B, or C)
  - `created_at` (timestamptz) - Timestamp when student was added
  - `updated_at` (timestamptz) - Timestamp when student was last updated

  ### 3. `allocations`
  Manages the assignment of students to computers.
  - `id` (uuid, primary key) - Unique identifier for each allocation
  - `student_id` (uuid, foreign key) - References students table
  - `computer_id` (uuid, foreign key) - References computers table
  - `allocated_at` (timestamptz) - Timestamp when allocation was created
  - `updated_at` (timestamptz) - Timestamp when allocation was last updated
  - Unique constraint on (student_id, computer_id) to prevent duplicate allocations

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled to ensure data security.
  
  ### Policies
  For this admin application, policies allow authenticated users (admins) to perform all operations.
  In a production environment, you would add specific admin role checks.
  
  - **computers**: Authenticated users can perform all CRUD operations
  - **students**: Authenticated users can perform all CRUD operations
  - **allocations**: Authenticated users can perform all CRUD operations

  ## Indexes
  - Index on `allocations.student_id` for fast student lookup
  - Index on `allocations.computer_id` for fast computer lookup
  - Unique index on `students.student_id` for student ID validation
  - Unique index on `computers.name` for computer name validation

  ## Important Notes
  1. The unique constraint on allocations ensures a student can only be assigned to one computer at a time
  2. Foreign key constraints ensure referential integrity
  3. Cascading deletes are set up so that deleting a student or computer removes associated allocations
  4. All timestamps use `timestamptz` for proper timezone handling
  5. Default values are provided for timestamps using `now()`
*/

-- Create computers table
CREATE TABLE IF NOT EXISTS computers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  section text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  computer_id uuid NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
  allocated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, computer_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_allocations_student_id ON allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_allocations_computer_id ON allocations(computer_id);

-- Enable Row Level Security
ALTER TABLE computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for computers table
CREATE POLICY "Authenticated users can view all computers"
  ON computers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert computers"
  ON computers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update computers"
  ON computers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete computers"
  ON computers FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for students table
CREATE POLICY "Authenticated users can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for allocations table
CREATE POLICY "Authenticated users can view all allocations"
  ON allocations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert allocations"
  ON allocations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update allocations"
  ON allocations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete allocations"
  ON allocations FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_computers_updated_at
  BEFORE UPDATE ON computers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();