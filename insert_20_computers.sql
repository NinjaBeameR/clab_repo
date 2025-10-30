-- Insert 20 computers into the database
-- Run this in your Supabase SQL Editor

INSERT INTO public.computers (name) VALUES
  ('Computer 1'),
  ('Computer 2'),
  ('Computer 3'),
  ('Computer 4'),
  ('Computer 5'),
  ('Computer 6'),
  ('Computer 7'),
  ('Computer 8'),
  ('Computer 9'),
  ('Computer 10'),
  ('Computer 11'),
  ('Computer 12'),
  ('Computer 13'),
  ('Computer 14'),
  ('Computer 15'),
  ('Computer 16'),
  ('Computer 17'),
  ('Computer 18'),
  ('Computer 19'),
  ('Computer 20')
ON CONFLICT (name) DO NOTHING;
