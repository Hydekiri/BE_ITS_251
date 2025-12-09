# Reset Database Script
# This script will drop all tables and recreate them with the updated schema

Write-Host "Resetting database with updated schema..." -ForegroundColor Yellow

# Drop all tables (in reverse order of dependencies)
Write-Host "`nDropping all tables..." -ForegroundColor Cyan
docker exec -i be-db-1 psql -U its -d its_db -c "
DROP TABLE IF EXISTS teacher_reports CASCADE;
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
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
"

# Recreate schema
Write-Host "`nCreating tables with updated schema..." -ForegroundColor Cyan
Get-Content src/config/db.sql | docker exec -i be-db-1 psql -U its -d its_db

# Load initial data
Write-Host "`nLoading initial data..." -ForegroundColor Cyan
Get-Content src/config/data.sql | docker exec -i be-db-1 psql -U its -d its_db

Write-Host "`nDatabase reset complete!" -ForegroundColor Green
Write-Host "All migrations are now included in db.sql" -ForegroundColor Green
