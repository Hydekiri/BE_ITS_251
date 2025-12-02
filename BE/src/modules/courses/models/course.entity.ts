import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ModuleEntity } from './module.entity';

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    subject?: string;

    @Column({ name: 'teacher_id', nullable: true })
    teacherId?: string;

    @Column({ name: 'teacher_name', nullable: true })
    teacherName?: string;

    @Column({ name: 'class_level', nullable: true })
    classLevel?: string;

    @Column({ nullable: true })
    status?: string;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl?: string;

    @Column({ name: 'estimated_duration_hours', type: 'int', nullable: true })
    estimatedDurationHours?: number;

    @Column({ name: 'enrollment_count', type: 'int', default: 0 })
    enrollmentCount: number;

    @Column({ name: 'average_rating', type: 'decimal', precision: 2, scale: 1, nullable: true })
    averageRating?: number;

    @OneToMany(() => ModuleEntity, (m) => m.course)
    modules?: ModuleEntity[];

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
