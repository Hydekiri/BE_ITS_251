-- Add fields to exercise_questions to support AI-generated questions
-- These questions don't necessarily come from question_bank

ALTER TABLE exercise_questions 
ADD COLUMN IF NOT EXISTS question_text TEXT,
ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS options JSONB,
ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(1);

-- Make question_bank_id nullable for AI-generated questions
ALTER TABLE exercise_questions 
ALTER COLUMN question_bank_id DROP NOT NULL;
