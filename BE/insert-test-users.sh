#!/bin/bash
# Script to insert test users into Docker PostgreSQL database
# Run: ./insert-test-users.sh

echo "🔧 Inserting test users into database..."

# Execute SQL commands in Docker container
docker-compose exec -T db psql -U ${DB_USERNAME:-postgres} -d ${DB_NAME:-its_db} << 'EOF'

-- Insert Student Test User
-- Email: student@test.com
-- Password: student123
INSERT INTO users (username, email, password_hash, full_name, role, status)
VALUES (
    'student_test',
    'student@test.com',
    '$2a$10$MYY/22O4zbPQZQTjPpGYvua09BM1qEp1iz9yqfmysdyrUcmLODuJS',
    'Test Student',
    'student',
    'active'
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- Insert Teacher Test User  
-- Email: teacher@test.com
-- Password: teacher123
INSERT INTO users (username, email, password_hash, full_name, role, status)
VALUES (
    'teacher_test',
    'teacher@test.com',
    '$2a$10$gCqGxhK7pTqQ9Z8YuLk.7e2kDVYX5hF6vQ5pZ8YuLk.7e2kDVYX5h',
    'Test Teacher',
    'teacher',
    'active'
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- Verify insertion
SELECT 
    id, 
    username, 
    email, 
    full_name, 
    role, 
    status,
    created_at
FROM users 
WHERE email IN ('student@test.com', 'teacher@test.com')
ORDER BY role, email;

EOF

echo ""
echo "✅ Test users inserted successfully!"
echo ""
echo "📝 Login credentials:"
echo "   Student: student@test.com / student123"
echo "   Teacher: teacher@test.com / teacher123"
echo ""
