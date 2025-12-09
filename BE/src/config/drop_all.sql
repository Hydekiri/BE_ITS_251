-- drop views
DROP VIEW IF EXISTS student_dashboard CASCADE;
DROP VIEW IF EXISTS teacher_course_overview CASCADE;

-- drop tables (thứ tự: con -> cha)
DROP TABLE IF EXISTS student_performance_summary CASCADE;
DROP TABLE IF EXISTS learning_analytics CASCADE;
DROP TABLE IF EXISTS knowledge_gaps CASCADE;
DROP TABLE IF EXISTS adaptive_learning_paths CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS ai_tutor_responses CASCADE;
DROP TABLE IF EXISTS ai_interactions CASCADE;
DROP TABLE IF EXISTS grading_rubrics CASCADE;
DROP TABLE IF EXISTS student_answers CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS exercise_questions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS question_bank CASCADE;
DROP TABLE IF EXISTS learning_materials CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS teacher_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- optionally ensure schema is clean
-- (uncomment if you want to recreate schema)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
