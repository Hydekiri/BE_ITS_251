-- Add explanation column to exercise_questions
ALTER TABLE exercise_questions
ADD COLUMN IF NOT EXISTS explanation TEXT;
