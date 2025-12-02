
-- Bảng người dùng
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    status VARCHAR(20) DEFAULT 'active',
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT check_valid_role CHECK (role IN ('student', 'teacher', 'admin')),
    CONSTRAINT check_valid_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role_status ON users(role, status);

-- Bảng hồ sơ người dùng
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    favorite_subjects TEXT[],
    learning_goals TEXT,
    learning_style VARCHAR(50),
    class_level VARCHAR(50),
    current_class_name VARCHAR(100),
    bio TEXT,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id_active ON user_sessions(user_id, is_active);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    class_level VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    learning_objectives TEXT,
    estimated_duration_hours INT,
    max_students INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subject_teacher ON courses(subject_id, teacher_id);
CREATE INDEX idx_status ON courses(status);

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sequence_order INT NOT NULL,
    estimated_duration_minutes INT,
    learning_objectives TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, sequence_order)
);

CREATE INDEX idx_course ON modules(course_id);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    lesson_type VARCHAR(50) NOT NULL,
    sequence_order INT NOT NULL,
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, sequence_order)
);

CREATE INDEX idx_module ON lessons(module_id);

CREATE TABLE learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    duration_seconds INT,
    file_size_mb DECIMAL(10, 2),
    description TEXT,
    sequence_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson ON learning_materials(lesson_id);

CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    options JSONB,
    correct_answer VARCHAR(1),
    model_answer TEXT,
    evaluation_rubric JSONB,
    starter_code TEXT,
    test_cases JSONB,
    explanation TEXT,
    created_by_user_id UUID REFERENCES users(id),
    source VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subject_difficulty ON question_bank(subject_id, difficulty_level);
CREATE INDEX idx_question_type ON question_bank(question_type);
CREATE INDEX idx_topic ON question_bank(topic);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    module_id UUID REFERENCES modules(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20),
    topic VARCHAR(200),
    num_questions INT DEFAULT 5,
    time_limit_minutes INT,
    generated_by VARCHAR(50),
    ai_prompt TEXT,
    generation_model VARCHAR(50),
    status VARCHAR(20) DEFAULT 'assigned',
    is_mandatory BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_status ON exercises(student_id, status);
CREATE INDEX idx_course_ex ON exercises(course_id);
CREATE INDEX idx_due_date ON exercises(due_date);

CREATE TABLE exercise_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    question_bank_id UUID NOT NULL REFERENCES question_bank(id),
    sequence_order INT NOT NULL,
    points_possible DECIMAL(5, 2) DEFAULT 1.0,
    UNIQUE(exercise_id, sequence_order)
);

CREATE INDEX idx_exercise ON exercise_questions(exercise_id);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    exam_type VARCHAR(50),
    num_questions INT NOT NULL,
    total_points DECIMAL(8, 2),
    passing_score DECIMAL(8, 2),
    time_limit_minutes INT,
    auto_generated BOOLEAN DEFAULT FALSE,
    generation_prompt TEXT,
    scheduled_start_time TIMESTAMP,
    scheduled_end_time TIMESTAMP,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    show_answers_after BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_exam ON exams(course_id);
CREATE INDEX idx_scheduled_times ON exams(scheduled_start_time, scheduled_end_time);

CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_bank_id UUID NOT NULL REFERENCES question_bank(id),
    sequence_order INT NOT NULL,
    points_possible DECIMAL(5, 2) DEFAULT 1.0,
    UNIQUE(exam_id, sequence_order)
);

CREATE INDEX idx_exam ON exam_questions(exam_id);

CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id),
    question_id UUID NOT NULL REFERENCES question_bank(id),
    answer_text TEXT,
    selected_option VARCHAR(1),
    code_submitted TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(5, 2),
    feedback TEXT,
    time_spent_seconds INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_exercise ON student_answers(student_id, exercise_id);
CREATE INDEX idx_student_exam ON student_answers(student_id, exam_id);
CREATE INDEX idx_question ON student_answers(question_id);

CREATE TABLE grading_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES question_bank(id),
    criteria_name VARCHAR(200),
    max_points DECIMAL(5, 2),
    description TEXT,
    evaluation_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    context_type VARCHAR(50),
    context_id UUID,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(50),
    tokens_used INT,
    is_helpful BOOLEAN,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student ON ai_interactions(student_id);
CREATE INDEX idx_context ON ai_interactions(context_type, context_id);

CREATE TABLE ai_tutor_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_hash VARCHAR(100) UNIQUE NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(50),
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INT DEFAULT 1
);

CREATE INDEX idx_prompt_hash ON ai_tutor_responses(prompt_hash);

CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    total_modules INT,
    modules_completed INT DEFAULT 0,
    total_lessons INT,
    lessons_completed INT DEFAULT 0,
    current_module_id UUID REFERENCES modules(id),
    current_lesson_id UUID REFERENCES lessons(id),
    overall_score DECIMAL(5, 2),
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_student_course ON learning_progress(student_id, course_id);

CREATE TABLE adaptive_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    recommended_sequence JSONB,
    difficulty_adjustment VARCHAR(50),
    estimated_completion_days INT,
    reason_for_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_course_alp ON adaptive_learning_paths(student_id, course_id);

CREATE TABLE knowledge_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    gap_level VARCHAR(50),
    identified_at TIMESTAMP,
    suggested_resources JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_course_kg ON knowledge_gaps(student_id, course_id);

CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    total_study_time_minutes INT,
    exercises_completed INT,
    exams_taken INT,
    ai_interactions_count INT,
    average_exercise_score DECIMAL(5, 2),
    average_exam_score DECIMAL(5, 2),
    correct_answers_percentage DECIMAL(5, 2),
    days_active INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date)
);

CREATE INDEX idx_student_date ON learning_analytics(student_id, date);

CREATE TABLE student_performance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    total_exercises INT DEFAULT 0,
    exercises_completed INT DEFAULT 0,
    average_score DECIMAL(5, 2),
    total_exams INT DEFAULT 0,
    exams_completed INT DEFAULT 0,
    exam_average DECIMAL(5, 2),
    learning_trend VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
);

CREATE INDEX idx_student_subject ON student_performance_summary(student_id, subject_id);

CREATE TABLE teacher_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    report_type VARCHAR(50),
    report_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teacher_course ON teacher_reports(teacher_id, course_id);

CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    enrollment_status VARCHAR(50) DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_student_status_ce ON course_enrollments(student_id, enrollment_status);
CREATE INDEX idx_course_ce ON course_enrollments(course_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50),
    title VARCHAR(200),
    message TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_user_created ON notifications(user_id, created_at);

-- Create unique partial index for soft delete
CREATE UNIQUE INDEX idx_unique_email_not_deleted ON users(email) WHERE deleted_at IS NULL;

-- User queries
CREATE INDEX idx_user_role_status ON users(role, status);
CREATE INDEX idx_user_email ON users(email);

-- Exercise/Exam queries
CREATE INDEX idx_exercise_student_status ON exercises(student_id, status);
CREATE INDEX idx_exam_schedule ON exams(scheduled_start_time, scheduled_end_time);

-- Analytics queries
CREATE INDEX idx_analytics_student_date ON learning_analytics(student_id, date);
CREATE INDEX idx_progress_student_course ON learning_progress(student_id, course_id);

-- Question bank queries
CREATE INDEX idx_question_subject_difficulty ON question_bank(subject_id, difficulty_level, question_type);

-- Views
CREATE VIEW student_dashboard AS
SELECT 
    u.id,
    u.full_name,
    (SELECT COUNT(*) FROM course_enrollments WHERE student_id = u.id AND enrollment_status = 'active') as active_courses,
    (SELECT COUNT(*) FROM exercises WHERE student_id = u.id AND status = 'submitted') as exercises_completed,
    (SELECT AVG(overall_score) FROM learning_progress WHERE student_id = u.id) as average_course_score,
    (SELECT AVG(correct_answers_percentage) FROM learning_analytics WHERE student_id = u.id AND date >= CURRENT_DATE - INTERVAL '30 days') as recent_accuracy
FROM users u
WHERE u.role = 'student' AND u.deleted_at IS NULL;

CREATE VIEW teacher_course_overview AS
SELECT 
    c.id,
    c.title,
    c.teacher_id,
    u.full_name as teacher_name,
    (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id AND enrollment_status = 'active') as enrolled_students,
    (SELECT AVG(overall_score) FROM learning_progress WHERE course_id = c.id) as class_average_score,
    (SELECT COUNT(*) FROM exercises WHERE course_id = c.id AND status = 'graded') as graded_exercises
FROM courses c
JOIN users u ON c.teacher_id = u.id;