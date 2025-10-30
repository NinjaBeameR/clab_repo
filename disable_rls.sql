-- Disable Row Level Security for development
-- Run this in your Supabase SQL Editor

ALTER TABLE computers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE allocations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view all computers" ON computers;
DROP POLICY IF EXISTS "Authenticated users can insert computers" ON computers;
DROP POLICY IF EXISTS "Authenticated users can update computers" ON computers;
DROP POLICY IF EXISTS "Authenticated users can delete computers" ON computers;

DROP POLICY IF EXISTS "Authenticated users can view all students" ON students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON students;

DROP POLICY IF EXISTS "Authenticated users can view all allocations" ON allocations;
DROP POLICY IF EXISTS "Authenticated users can insert allocations" ON allocations;
DROP POLICY IF EXISTS "Authenticated users can update allocations" ON allocations;
DROP POLICY IF EXISTS "Authenticated users can delete allocations" ON allocations;
