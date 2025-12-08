/**
 * Script to generate test users with proper bcrypt password hashes
 * Run with: node generate-test-users.js
 * 
 * This creates SQL INSERT statements for test users
 */

const bcrypt = require('bcryptjs');

async function generateTestUsers() {
    console.log('Generating test users with bcrypt hashed passwords...\n');

    const users = [
        {
            username: 'student_test',
            email: 'student@test.com',
            password: 'student123',
            fullName: 'Test Student',
            role: 'student',
        },
        {
            username: 'teacher_test',
            email: 'teacher@test.com',
            password: 'teacher123',
            fullName: 'Test Teacher',
            role: 'teacher',
        },
    ];

    console.log('-- Test users SQL');
    console.log('-- Generated on:', new Date().toISOString());
    console.log('-- IMPORTANT: Run this after the database schema is created\n');

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        console.log(`-- ${user.fullName} (${user.email})`);
        console.log(`-- Password: ${user.password}`);
        console.log(`INSERT INTO users (username, email, password_hash, full_name, role, status)`);
        console.log(`VALUES ('${user.username}', '${user.email}', '${hashedPassword}', '${user.fullName}', '${user.role}', 'active')`);
        console.log(`ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`);
        console.log('');
    }

    console.log('\n✅ Test users generated successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Student: student@test.com / student123');
    console.log('   Teacher: teacher@test.com / teacher123');
}

generateTestUsers().catch(console.error);
