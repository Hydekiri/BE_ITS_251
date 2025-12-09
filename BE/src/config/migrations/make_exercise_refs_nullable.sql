-- Make student_id and course_id nullable for AI-generated exercises
ALTER TABLE exercises 
ALTER COLUMN student_id DROP NOT NULL,
ALTER COLUMN course_id DROP NOT NULL;
