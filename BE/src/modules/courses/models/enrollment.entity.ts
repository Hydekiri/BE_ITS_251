import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('course_enrollments')
export class Enrollment {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'student_id' })
    studentId: string;

    @Column({ name: 'course_id' })
    courseId: string;

    @Column({ name: 'enrollment_status', default: 'active' })
    enrollmentStatus: string;

    @Column({ name: 'enrolled_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    enrolledAt: Date;

    @Column({ name: 'progress_percentage', type: 'int', default: 0 })
    progressPercentage: number;
}
