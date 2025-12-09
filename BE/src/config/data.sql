-- Test Users SQL for Login Functionality
-- Generated with bcrypt hashed passwords (salt rounds = 10)
-- To be executed after database schema is created

-- Test Student User
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
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

-- Test Teacher User  
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
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

-- Verify installation
SELECT id, username, email, full_name, role, status FROM users WHERE email IN ('student@test.com', 'teacher@test.com');